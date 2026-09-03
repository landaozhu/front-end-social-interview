LCEL（LangChain Expression Language）就是用 `|` 把 Runnable 串成新链。每个环节都是 Runnable：统一 `invoke` / `ainvoke` / `stream` / `batch`。

```python
chain = prompt | model | parser
chain.invoke({'topic': 'ReAct'})
```

数据从左到右：prompt 产出消息 → model 产出 AIMessage → parser 变成你要的字符串或对象。

## 为什么要这一层

旧版 `LLMChain` 一类封装死、难插流式和并发。LCEL 的好处：

- **组合**：链还能再 `|` 进更大的链
- **接口统一**：自己写的函数用 `RunnableLambda` 包一下就能进管道
- **流式 / 批量 / 异步** 自动往下传，不必每个组件手写三套
- **并行**：`RunnableParallel` 同时跑检索和改写

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

rag = (
    RunnableParallel(context=retriever, question=RunnablePassthrough())
    | prompt
    | model
    | parser
)
```

`RunnablePassthrough` 原样传递用户问题；并行把 context 和 question 打成 dict，再填进 prompt。

## 面试 60 秒

LCEL 用 `|` 拼 Runnable。Prompt、ChatModel、Parser、Retriever 都是同一套 invoke/stream。并行用 `RunnableParallel`，透传用 `Passthrough`。看懂数据在管道里长什么样，比背类名重要。

## 追问

**`|` 底层是什么？**

`__or__`，左边 `pipe` 右边，得到 `RunnableSequence`。

**出错了怎么定位？**

看中间输入输出：prompt 之后应是 messages，model 之后是 AIMessage。LangSmith / 回调能打每一步。不要整链当黑盒。

**自定义步骤？**

`RunnableLambda(lambda x: ...)` 或自己实现 Runnable。保持输入输出类型和下一步对齐。
