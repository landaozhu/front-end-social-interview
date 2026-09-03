LLM 本身无状态：每次请求只看你这次塞进去的 messages。Memory 就是 **你在调用之间把该带的历史存下来、下次再塞进 Prompt**。

LangChain 把这件事收成 Memory 组件，常见几种：

| 类型 | 记住什么 | 适合 |
|------|----------|------|
| Buffer | 原文全量消息 | 短对话 |
| Window | 最近 k 轮 | 控制 token |
| Summary | 旧历史压缩成摘要 | 长会话 |
| Token 限制 | 按 token 裁剪 | 死守上下文窗口 |

本质都是：读历史 → 填进 `MessagesPlaceholder('history')` → 调模型 → 把本轮 human/ai 写回存储。

```python
# 概念上：不是背 API 名
history = memory.load()
messages = prompt.invoke({'history': history, 'input': user})
ai = model.invoke(messages)
memory.save(user, ai)
```

## 生产里要注意

- **按会话隔离**：key 用 `session_id` / `user_id`，别把 A 的历史给 B。
- **不要无限 Buffer**：上下文满了就贵、就慢、就丢重点。Window 或 Summary。
- **敏感信息**：Memory 里可能有手机号、token，存储和日志要脱敏。
- **和 RAG 不是一回事**：Memory 是对话状态；RAG 是外部知识。长文档该检索，不该全塞进 Memory。

## 面试 60 秒

模型无状态，Memory 是会话侧的历史管理：加载 → 放进 Prompt → 调用 → 写回。短聊 Buffer，长聊 Window/Summary。按会话隔离，别和 RAG 混成「什么都塞进 context」。

## 追问

**多轮 tool 调用算 Memory 吗？**

那是这一次 Agent 循环里的 messages（含 ToolMessage），属于单次运行时状态。Memory 通常指跨用户回合的历史。

**存在哪？**

开发用内存；生产用 Redis / DB。只说「LangChain Memory 类」不够，要能说出持久化和隔离。
