Chain 是 **固定流水线**：输入进 Prompt，进模型，进 Parser，路径你写死。Agent 是 **模型自己选下一步**：看问题 → 决定调哪个 tool / 是否直接答 → 看结果 → 再决定，直到给出最终答案。

```text
Chain:  用户 → Prompt → LLM → Parser → 输出
Agent:  用户 → LLM ⇄ Tools（多轮）→ 输出
```

## 在 LangChain 里怎么对应

- **Chain**：LCEL `prompt | model | parser`，或 Retriever 拼进去的 RAG 链。步骤数编译期就定了。
- **Agent**：一组 Tools + ChatModel + 提示词，跑执行器（如 `AgentExecutor`）。循环次数运行时才知道。

该用 Chain 的：检索问答、分类、固定改写。流程稳定，便宜、好测、少乱跑。

该用 Agent 的：事先不知道要不要查天气、查库、还是三个都查。把选择权交给模型。

## 成本与风险

Agent 多几轮模型调用，延迟和钱都上去；tool 选错会幻觉式调用。能用 Chain 表达的，不要上 Agent。

多步带分支、循环、人工审批的状态机，官方更推图编排；**那是另一套（LangGraph），本题只要求分清 Chain 和 Agent。**

## 面试 60 秒

Chain 路径固定，Agent 路径由模型 + 工具循环决定。LangChain 里 LCEL 就是 Chain；Tools + Executor 才是 Agent。能预知步骤就用 Chain，更稳更便宜。

## 追问

**ReAct 是 Chain 还是 Agent？**

Agent 的一种推理格式：Thought / Action / Observation 循环。实现可以是 ReAct 提示词，也可以是原生 tool calling，都是 Agent。

**Agent 死循环？**

限制 `max_iterations`，tool 做超时和幂等，观察里明确「查不到」。
