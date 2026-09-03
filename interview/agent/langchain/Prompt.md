LangChain 里 Prompt 不是一句字符串，而是 **带变量的模板**，渲染成模型能吃的输入。

聊天模型和补全模型模板不是同一种：

| | PromptTemplate | ChatPromptTemplate |
|--|----------------|---------------------|
| 面向 | 老式补全 LLM（一段文本进一段文本出） | Chat Model（多轮角色消息） |
| 产物 | `string` | `messages`（system / human / ai） |
| 现在 | 很少单独用 | **默认用这个** |

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ('system', '你是检索问答助手，只根据 {context} 回答。'),
    ('human', '{question}'),
])
```

`invoke({'context': '...', 'question': '...'})` 得到一组 BaseMessage。再 `|` 给 ChatModel。

## 消息角色

- **system**：人设、硬约束（「不要编造」「用中文」）
- **human**：用户本轮输入
- **ai**：模型历史回复；few-shot 时也可写死在模板里

MessagesPlaceholder 用来插入「历史对话」或「tool 结果列表」，变量是动态长度的消息数组，不是一个字符串。

## 面试 60 秒

Chat 模型用 `ChatPromptTemplate` 产出 messages，不要把一切塞成一段 string。system 放规则，human 放问题，历史用 Placeholder。变量名必须和 invoke 的 dict key 对齐，缺 key 会报错。

## 追问

**few-shot 怎么放？**

模板里写几轮 human/ai 示范，或 `FewShotChatMessagePromptTemplate` 按相似度挑例子。示范质量比堆长度重要。

**和直接 messages=[{role, content}] 比？**

模板能复用、能校验变量、能进 LCEL。一次性脚本直接拼 messages 也行。
