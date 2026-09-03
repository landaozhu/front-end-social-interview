`async def` 定义协程，`await` 把控制权交还给事件循环，等 IO 结束再继续。Python 默认一次只跑一个线程里的事件循环（asyncio），适合 **大量等待网络** 的活，不适合硬算。

调 LLM、向量库、搜网页全是网络 IO，所以 LangChain 同时提供同步和异步两套：

| 同步 | 异步 |
|------|------|
| `invoke` | `ainvoke` |
| `stream` | `astream` |
| `batch` | `abatch` |

## 最小例子

```python
import asyncio

async def call_llm(prompt):
    # 真实场景是 await model.ainvoke(prompt)
    await asyncio.sleep(0.1)
    return prompt.upper()

async def main():
    a, b = await asyncio.gather(
        call_llm('什么是 Agent'),
        call_llm('什么是 RAG'),
    )
    print(a, b)

asyncio.run(main())
```

`gather` 让两个请求重叠等待，总耗时接近较慢的那一个，而不是相加。这是 Agent 里并行调多个 tool / 多个子链的基础。

## 面试容易踩的坑

- 在 `async def` 里用同步 `invoke`：事件循环被阻塞，并发全废。LangChain 里能 `await` 就用 `a*` 方法。
- 忘了 `await`：拿到的是协程对象，不是结果。
- 在已经运行的 loop 里再 `asyncio.run`：会报错。Web 框架（FastAPI）自己有 loop，写 `await chain.ainvoke(...)` 即可。

## 和 Agent 的关系

一次用户问题可能：检索 + 调天气 tool + 再生成。三次都是 HTTP。同步串行 3×延迟；异步 gather / 并行 tool 能压到约 1×。这也是为什么生产服务用 FastAPI + `ainvoke`，脚本才用同步 `invoke`。

## 面试 60 秒

asyncio 适合 IO 密集。LangChain 同步 `invoke`、异步 `ainvoke`，流式对应 `stream` / `astream`。服务端并发必须走异步，且不要在协程里调用同步阻塞的 LLM 客户端。

## 追问

**和多线程比？**

线程能并行阻塞 IO，但有 GIL、切换成本、共享状态要锁。asyncio 单线程协作式，适合高并发连接。LLM 调用两者都能用，服务端更常见 asyncio。

**`batch` 和 `gather` 多个 `ainvoke`？**

`batch` 是 Runnable 自己的批量接口，可能内部做连接复用；`gather` 是你在业务层拼并发。能用官方 `abatch` 就先用。
