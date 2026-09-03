LangChain 是一套 **把 LLM 应用拆成可拼装模块** 的框架：Prompt、Model、Tool、Retriever、OutputParser、Memory。你不直接每次手写 HTTP + 拼消息 + 自己 parse JSON，而是用统一的 Runnable 接口把它们串起来。

## 它在解决什么

直接调 OpenAI SDK 也能做聊天。一旦要：

- 同一套业务接多家模型
- Prompt 模板化、少样本
- 检索增强（RAG）
- 给模型工具（查天气、查库）
- 流式、回调、结构化输出

就会出现大量胶水代码。LangChain 把这些收成组件，用 **LCEL**（`|` 管道）连接。

| 自己调 SDK | LangChain |
|------------|-----------|
| 自己拼 messages | `ChatPromptTemplate` |
| 自己正则抠 JSON | OutputParser / Pydantic |
| 自己写检索再塞 context | Retriever \| Prompt \| Model |
| 换模型改一堆调用处 | 换一个 ChatModel 实现 |

代价：抽象多、版本迭代快、出问题要会拆到「到底是 prompt、模型还是检索」。面试要能说清 **什么时候用、什么时候直接 SDK 更干净**。

## 什么时候不必上

一次调用、没有检索、没有 tool、没有多步，直接 SDK 更短、更好 debug。LangChain 适合「链」已经比「一次 chat completion」长的时候。

## 面试 60 秒

LangChain 不是模型，是 LLM 应用的组件层：统一 Prompt、模型、工具、检索、解析。和直接调 SDK 比，换模型、拼 RAG、接 tool 更省事；简单聊天不必上。核心接口是 Runnable：`invoke` / `stream` / `batch`。

## 追问

**和 LlamaIndex 比？**

LlamaIndex 更偏索引和 RAG 数据层；LangChain 更偏编排和 Agent 组件。可以混用。点到即可。

**LangChain 和 LangGraph？**

LangGraph 是后来的图编排（循环、状态、多 Agent）。这题按链和工具答，图先不展开。

**核心包怎么拆的？**

`langchain-core`：Runnable、消息、tool 协议；`langchain-openai` 这类是厂商集成；`langchain` 是高阶链和仓库组件。面试说到「core 是协议、集成包是模型」就够。
