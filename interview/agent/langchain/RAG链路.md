LangChain 做 RAG 就是把「查资料再回答」拆成可替换的 Runnable，而不是在 Prompt 里写死一篇文档。

标准链路：

```text
文档 → Loader → Splitter → Embedding → VectorStore
用户问题 → Retriever → 拼进 Prompt → ChatModel → Parser
```

| 组件 | 干什么 |
|------|--------|
| Loader | 读 PDF / 网页 / Markdown 成 Document |
| Splitter | 切块（按字符 / token，保留 overlap） |
| Embedding | 块变成向量 |
| VectorStore | 存向量，按相似度取 Top-K |
| Retriever | 对问题检索，返回 Document 列表 |
| Prompt | `{context}` + `{question}` |

```python
rag = (
    {'context': retriever, 'question': RunnablePassthrough()}
    | prompt
    | model
    | parser
)
```

Retriever 作为 Runnable，输入问题，输出文档；再和问题一起填模板。这就是 LCEL 版 RAG。

## 容易挂的地方

- **切块太大**：噪声多；**太小**：句子被截断。overlap 用来保住跨块语义。
- **只向量检索**：专有名词、编号对不上，要考虑关键词混合检索。
- **context 塞爆窗口**：Top-K 和块大小一起算 token。
- **模型爱编**：Prompt 写明「没有就说没有」，并引用 chunk。

## 面试 60 秒

LangChain RAG = Loader → 切分 → Embedding → 向量库 → Retriever 拉 context → Prompt → 模型。链用 LCEL 拼。调优优先切块、Top-K、提示词，而不是换一个更大的模型。

## 追问

**Retriever 和 VectorStore 区别？**

Store 负责存和相似度搜索；Retriever 是「给一个 query 返回 Document」的接口，后面可以是向量、BM25、或多路融合。链只依赖 Retriever。

**要不要每次重切 embedding？**

文档变了才更新索引。问答路径只检索，不现场 embed 全库。
