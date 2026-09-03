GIL（Global Interpreter Lock）是 CPython 的一把进程级大锁：同一个进程里，**同一时刻只有一个线程在执行 Python 字节码**。所以多线程 **加速不了 CPU 密集计算**（图像、大循环、纯 Python 加密）。

它 **不阻止 IO 等待时释放锁**：请求 LLM、读磁盘、`time.sleep` 时，其他线程可以跑。所以「多线程爬网页 / 调 API」仍然有用。

## 和 Agent 有什么关系

调 LLM、向量数据库、搜索 API 全是 IO。用线程池并行打几个 tool，GIL 不是瓶颈；瓶颈是网络和 token 速度。

真要算密集（本地 embedding 大批量、用 Python 做特征）应：

- 多进程 `multiprocessing`（每个进程一把 GIL）
- 或丢给 C/CUDA 库（NumPy、推理引擎在 C 里自己释放 GIL）
- 或换 asyncio：IO 并发不一定要多线程

## 面试 60 秒

GIL 让一个进程里的多线程跑不了真并行 Python 计算，但 IO 会放锁，所以 LLM 这种网络活多线程/asyncio 都合理。Agent 服务卡的是 token 和检索，不是 GIL。CPU 密集再谈多进程。

## 追问

**为什么还要线程？**

阻塞式 SDK 没有 async 时，用线程避免卡住主线程。有 `ainvoke` 就优先 asyncio。

**Jython / 多解释器？**

面试点到 CPython 即可。别往 nogil 分支展开，除非面试官追。
