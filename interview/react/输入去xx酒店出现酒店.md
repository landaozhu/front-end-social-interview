用户在浏览器输入“帮我找上海迪士尼附近 500 元以内的酒店”，前端先通过 HTTPS 把请求发送给 Node BFF。HTTPS 应用层下面实际上是 HTTP + TLS，传输层通常基于 TCP；浏览器和服务器会帮我们处理 TCP 连接，业务前端一般不直接操作 TCP Socket。

到 Node BFF 后，我会调用 LLM，把自然语言通过 Structured Output / Function Calling 转成结构化搜索参数，比如城市、POI、入住日期、价格、评分等。

然后 BFF 调用真正的 Hotel Search Service，从 ES、Redis、数据库以及价格库存服务中获取真实酒店。这里酒店名称、价格和库存不能让 AI 生成，避免幻觉。

搜索得到候选酒店以后，可以先通过业务规则排序，如果用户有“安静、适合亲子”这种模糊需求，再结合评论 Embedding/RAG 或 Ranking Model 做语义召回和 rerank。

最后把真实酒店数据交给 LLM 生成推荐理由，再返回前端。

通信方式上，我会优先选择 SSE，而不是 WebSocket。 因为这个场景主要是用户发一次请求，服务端持续把 AI token、搜索状态和酒店结果推给浏览器，本质上是服务端到客户端的单向流式传输，SSE 更简单，而且基于 HTTP，断线重连也比较方便。

比如服务端可以依次推送 search_params、hotels、message_delta、done 事件。前端收到 hotels 就先渲染酒店卡片，同时 message_delta 持续展示 AI 推荐文案。

如果以后产品需要真正的高频双向实时通信，例如语音 AI，用户持续上传音频，同时服务端不断返回音频或者文本，这时候我才更倾向 WebSocket。

所以整体链路就是：浏览器 → HTTPS/TCP → Node BFF → LLM 意图识别 → Hotel Search/ES/Redis/价格库存服务 → 排序/Rerank → LLM 生成推荐理由 → SSE 流式返回 → React 渲染酒店卡片。