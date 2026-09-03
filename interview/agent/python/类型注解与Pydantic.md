Python 类型注解默认 **不运行时强制**（`city: str` 只是给人和工具看的）。真要校验数据，用 **Pydantic**：定义 `BaseModel`，进来的 dict 会按类型解析、缺字段报错。

LangChain 大量依赖这一套：tool 参数、结构化输出、消息 schema。

## 注解本身

```python
def search(city: str, days: int = 1) -> str:
    ...
```

`@tool` 会读这些注解，生成 JSON Schema 给模型。没有注解，模型不知道 `days` 是数字。

`Optional[str]`、`list[str]`、`TypedDict` 都会进 schema。这是 Python 侧和 LLM 的「合同」。

## Pydantic 干什么

```python
from pydantic import BaseModel, Field

class Weather(BaseModel):
    city: str = Field(description='城市名')
    temp: float
    unit: str = 'celsius'
```

用途：

1. **结构化输出**：`model.with_structured_output(Weather)`，让模型按字段吐 JSON，而不是一段散文再自己正则抠。
2. **Tool 入参**：复杂参数用 BaseModel，比一堆 `str` 稳。
3. **配置**：API Key、模型名、温度，启动时校验一遍，少把 None 传到 OpenAI。

校验失败会抛 `ValidationError`，应在 Agent 里当成 tool 错误喂回模型或直接返回给用户，不要静默吞。

## 面试 60 秒

类型注解是给 LangChain / IDE 看的合同，默认不强制执行。Pydantic 才在运行时解析和校验。Agent 里用它定义 tool 参数和结构化输出，比「模型自由发挥再 parse」稳得多。

## 追问

**和 TypeScript interface 比？**

TS 注解编译完就没了（除非 Zod）。Pydantic 是运行时校验，更像 Zod + class。LLM 输出不可信，所以必须运行时校验。

**`with_structured_output` 失败怎么办？**

模型没按 schema 走。可以重试、降级成普通文本，或把校验错误当 observation 再让模型改一版。不要假设一次必成功。
