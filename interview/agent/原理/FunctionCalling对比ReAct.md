两者都是「模型用工具」，差在 **协议和谁来解析动作**。

| | ReAct（文本） | Function Calling |
|--|----------------|------------------|
| 模型输出 | 一段 Thought/Action 文本 | 结构化 `tool_calls`（JSON） |
| 解析 | 正则 / 自定义 parser，易碎 | 解码器约束，稳 |
| 多工具 | 靠提示词列举 | schema 列表，模型选 name |
| 并行 | 一般一轮一个 Action | 有的模型一轮多个 tool_calls |
| 现状 | 教学、无 FC 的开源模型 | **生产默认** |

Function Calling 仍在跑 ReAct 那个圈：调完 tool → 把结果当 observation 再问模型。只是 Action 不再用自然语言协议。

## 怎么选

- 模型支持 tools / function calling → 用 FC，`bind_tools` 或 tool-calling Agent
- 模型只会补全、没有 tool 接口 → 只能 ReAct 提示词 + 解析器
- 需要「看得见的推理过程」做研究或教学 → 显式 Thought；生产可关掉

不要说「有了 FC 就没有 ReAct」。ReAct 是 **循环策略**，FC 是 **工具调用的编码方式**。

## 面试 60 秒

ReAct 是边想边调工具的循环；Function Calling 是把「调哪个工具、参数是什么」变成模型原生的结构化输出。生产优先 FC，解析稳、少幻觉格式。没有 FC 的模型才退回文本 ReAct。循环本身还在。

## 追问

**一轮多个 tool_calls？**

互相独立的查询（天气 + 汇率）可以并行，降延迟。有先后依赖（先搜 id 再查详情）必须串行，第二轮再调。

**模型编造不存在的函数名？**

白名单校验：不在 schema 里的调用直接当错误 observation 返回，或拒绝执行。
