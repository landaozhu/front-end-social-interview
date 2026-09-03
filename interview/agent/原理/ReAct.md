ReAct = **Reasoning + Acting**：让模型先出一段思考（Thought），再声明动作（Action + 参数），拿到环境反馈（Observation），然后继续想，直到 Final Answer。

论文想解决的是：只想不行动会幻觉；只调工具不思考会乱调。二者交替。

```text
Thought: 用户问天气，我没有实时数据
Action: get_weather
Action Input: {"city": "上海"}
Observation: 小雨, 22℃
Thought: 已经够回答了
Final Answer: 明天上海小雨，建议带伞
```

## 和现在工程的关系

早期用 **提示词格式** 把 Thought/Action 解析出来（文本协议，脆弱）。现在主流是 **原生 Function Calling**：思考可以留在模型内部，对外只返回结构化 `tool_calls`。思想仍是 ReAct 循环，协议更稳。

LangChain 的 Agent 执行器就是在跑这个圈：模型输出 → 解析要调的 tool → 执行 → observation 写回 messages → 再调模型。

## 面试 60 秒

ReAct 让模型边想边动手：Thought → Action → Observation 循环，减少瞎编和瞎调工具。现代实现多用 function calling 承载 Action，不必再正则抠 `Action:` 文本。它是 Agent 的推理模式，不是一个单独的模型。

## 追问

**Thought 一定要输出给用户吗？**

不必。给用户看最终答案；Thought 可打日志做调试。有些产品展示「正在查天气」提升可信度。

**ReAct 失败模式？**

死循环、编造 Observation、Action 名写错。要用步数上限、tool 白名单、把真实 tool 错误传回去而不是假装成功。
