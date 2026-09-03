模型默认吐的是自然语言。业务要的是 **字符串里的某段、JSON、或一个 Pydantic 对象**。OutputParser 把 `AIMessage` 转成下游能用的类型，接在 LCEL 最后一环：`prompt | model | parser`。

## 常见几种

| Parser | 产出 | 场景 |
|--------|------|------|
| StrOutputParser | `str` | 只要文本，剥掉 AIMessage |
| JsonOutputParser | `dict` | 模型被要求吐 JSON |
| Pydantic / 结构化输出 | `BaseModel` | 字段要校验 |
| 自定义 | 任意 | 正则、枚举 |

现在更稳的做法是 **模型侧结构化输出**（`with_structured_output(MyModel)`），用 tool calling / json mode 约束解码，而不是生成完再「从散文里抠」。Parser 仍负责失败时抛错或重试。

## 为什么不能省

没有 Parser：下一环拿到 AIMessage，RAG 评估、写库、前端类型都会碎。有 Parser：链的 `invoke` 直接返回业务对象。

失败要当一等公民：JSON 缺字段、类型不对 → `OutputParserException`。可以套 retry 解析器，或把错误丢回模型再生成一次。

## 面试 60 秒

Parser 是链的出口类型转换。简单用 `StrOutputParser`；要字段用 Pydantic 结构化输出，优先模型原生约束，而不是生成后再正则。解析失败要重试或报错，不能当成功。

## 追问

**和 Prompt 里写「请输出 JSON」比？**

只靠提示词，模型偶尔加 \`\`\`json 围栏或少逗号。Schema + 结构化输出可靠得多。

**流式时 Parser 怎么工作？**

有的 Parser 支持增量（先出部分 JSON）。多数等完整 message 再 parse。UI 可以先 `stream` 原文，结束再 parse 一份结构化结果。
