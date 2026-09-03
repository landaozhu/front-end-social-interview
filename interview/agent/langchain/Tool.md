Tool 就是给 LLM 调用的 **带 schema 的函数**：名字、描述、参数类型。模型不执行代码，它只决定「要不要调、用什么参数」；真正执行的是你的 Python 函数，结果再作为 observation 喂回去。

## 怎么声明

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询城市当前天气。"""
    return '晴, 26℃'
```

描述和类型注解会进 schema。描述要写清 **什么时候用**，否则模型会乱调或从不调。

## 两条接入路径（先分清）

| 方式 | 谁决定调不调 | 典型 API |
|------|----------------|----------|
| 模型原生 function calling | 模型按 schema 返回 tool_calls | `model.bind_tools([get_weather])` |
| Agent 循环 | 模型可能多次调工具再结束 | `create_tool_calling_agent` + `AgentExecutor` |

`bind_tools` 只是「这一次调用允许用这些工具」，你还要自己看 `AIMessage.tool_calls`、执行、再把 `ToolMessage` 塞回去。AgentExecutor 把这个循环包掉了。

## 面试 60 秒

Tool 是给模型看的函数说明书 + 真执行的 Python。`@tool` 用名字、docstring、类型生成 schema。`bind_tools` 是单轮工具调用；要模型自己连着调多次，才上 Agent。工具描述写不好，Agent 会瞎调。

## 追问

**tool 报错怎么办？**

把异常变成字符串 observation 返回给模型，让它改参数或换工具；不要直接把栈甩给用户。副作用工具（下单、删数据）要鉴权 + 二次确认。

**和 OpenAI tools 参数是什么关系？**

同一件事。LangChain 把 Python 函数编成 OpenAI / 各家的 tools JSON。换模型时 schema 协议略有差异，core 的 `@tool` 帮你挡一层。
