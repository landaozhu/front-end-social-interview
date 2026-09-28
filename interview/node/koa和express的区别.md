Koa vs Express：25K 前端 / Node.js 面试回答

一句话总结：Express 是功能相对完整、生态成熟的 Web 框架；Koa 是更轻量、以 async/await 和洋葱模型为核心的 Web 框架。

两者都能开发 REST API、后台管理系统和 BFF，核心区别在于中间件机制、框架内置能力以及请求与响应的处理方式。

一、面试官问：Koa 和 Express 有什么区别？
1. 核心对比

| 维度 | Express | Koa |
|---|---|---|
| 设计理念 | 简洁实用，提供路由等基础 Web 能力 | 更轻量，核心功能更精简 |
| 中间件模型 | 按 next() 推进的中间件链 | 基于 async/await 的洋葱模型 |
| 请求响应对象 | req、res | ctx，封装 request 和 response |
| 路由 | 内置 Router | 通常使用 @koa/router |
| 响应处理 | res.json()、res.send() | ctx.body = data |
| 异常处理 | Express 5 支持自动转发异步错误 | 常用顶层 try/catch 中间件 |
| 典型框架 | NestJS 默认使用 Express | Egg.js 基于 Koa |

注意：Express 5 已支持自动处理返回 Promise 的路由和中间件中的拒绝或异常，不能再简单地说 Express 不支持 async/await。

2. 面试时可以直接这样回答

Express 和 Koa 都是 Node.js Web 框架。

Express 提供了路由、中间件和请求响应处理等能力，生态成熟，适合快速构建 Web 服务。

Koa 的核心更轻量，主要提供中间件组合和上下文封装。它最大的特点是基于 async/await 的洋葱模型，中间件可以在 await next() 前后分别执行逻辑。

我认为两者最重要的区别是中间件执行机制。Express 通常通过 next() 将控制权交给下一个中间件，而 Koa 使用 await next()，当前中间件可以等待下游执行完成，再继续处理响应。

例如，统一日志、耗时统计、异常捕获等横切逻辑，在 Koa 中可以通过一个中间件同时处理请求前和响应后的逻辑。

不过，Express 也能通过响应事件、封装函数或其他机制实现类似功能，并不是 Koa 才能实现。

二、核心考点：中间件执行机制

这是整道题最值得深入讲的地方。

1. Express：通过 next() 推进中间件

```javascript
const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log('1. 中间件 A 开始');
  next();
  console.log('4. 中间件 A 结束');
});

app.use((req, res, next) => {
  console.log('2. 中间件 B 开始');
  next();
  console.log('3. 中间件 B 结束');
});

app.get('/', (req, res) => {
  res.json({ message: 'hello' });
});

app.listen(3000);
```

输出：

```
1. 中间件 A 开始
2. 中间件 B 开始
3. 中间件 B 结束
4. 中间件 A 结束
```

你可能会问：Express 不也是洋葱模型吗？

从这个同步示例来看，确实也呈现出先进入、后退出的执行顺序。

但是 Express 的 next() 不会返回一个代表下游中间件全部完成的 Promise，因此无法直接通过 await next() 等待后续异步业务完成。

看下面这个例子：

```javascript
app.use(async (req, res, next) => {
  console.log('A 开始');

  next();

  console.log('A 结束');
});

app.get('/', async (req, res) => {
  await new Promise(resolve =>
    setTimeout(resolve, 1000)
  );

  console.log('业务完成');

  res.json({ success: true });
});
```

输出：

```
A 开始
A 结束
业务完成
```

A 结束时，业务实际上还没有完成。

这就是 Express 和 Koa 在中间件组合机制上的关键区别。

2. Koa：基于 async/await 的洋葱模型

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log('1. A 开始');

  await next();

  console.log('4. A 结束');
});

app.use(async (ctx, next) => {
  console.log('2. B 开始');

  await next();

  console.log('3. B 结束');

  ctx.body = { success: true };
});

app.listen(3000);
```

输出：

```
1. A 开始
2. B 开始
3. B 结束
4. A 结束
```

Koa 洋葱模型执行过程

```
Middleware A
进入
   ↓
Middleware B
进入
   ↓
Controller / 业务逻辑
查询数据库、调用服务等
   ↓
Middleware B
返回
   ↓
Middleware A
返回
```

请求由外向内执行，等待下游完成后，再由内向外恢复执行。

关键代码就是：

```javascript
await next();
```

它包含两个动作：

调用 next()，执行下游中间件。

await 等待下游中间件返回的 Promise 完成，然后继续执行当前中间件的后续代码。

所以，Koa 可以自然地在 await next() 前处理请求，在它后面处理响应。

面试加分点：Koa 的洋葱模型不是因为 async/await 本身才存在，而是因为它的中间件组合机制会返回下游执行的 Promise，async/await 让这种控制流程更容易表达。

三、实际场景：如何统计一个接口的耗时？

假设订单接口需要查询数据库，耗时 100ms。

Koa 的实现

```javascript
app.use(async (ctx, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;

  console.log(`耗时：${duration}ms`);
});
```

这里 await next() 会等待后续中间件中的异步数据库查询完成，因此可以统计到业务处理耗时。

但需要注意，它统计的是下游中间件完成的时间，不等于客户端完整接收响应的时间。

Express 的实现

```javascript
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    console.log(`耗时：${duration}ms`);
  });

  next();
});
```

Express 可以监听响应的 finish 事件，统计服务端完成响应写入的时间。

如果还需要处理客户端提前断开连接的情况，可以结合 close 事件，但需要避免重复记录。

结论：两者都能实现耗时统计，只是 Koa 可以利用 await next() 自然地包装下游异步执行，而 Express 通常需要借助响应事件等机制。

四、面试官追问：Koa 和 Express 的异常处理有什么区别？
1. Koa：顶层中间件统一捕获

```javascript
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    ctx.body = {
      message: '服务器异常',
    };

    ctx.app.emit('error', err, ctx);
  }
});
```

因为 await next() 可以等待下游 Promise，所以能够通过顶层 try/catch 捕获下游传播上来的同步异常和异步异常。

注意，未被等待的异步任务中的异常不一定能被它捕获。

2. Express：错误处理中间件

Express 5 支持自动将异步路由或中间件返回的 Promise 拒绝传递给错误处理流程。

```javascript
app.get('/orders', async (req, res) => {
  const orders = await getOrders();

  res.json(orders);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: '服务器异常',
  });
});
```

如果 getOrders() 抛出异常，Express 5 会自动调用错误处理流程。

Express 4 则通常需要手动 next(err)，或者使用异步包装函数。

因此，不能把“Express 无法捕获异步异常”当成两者的区别，必须区分版本。

五、面试官问：Koa 和 Express 怎么选？

| 业务场景 | 选型考虑 |
|---|---|
| 简单 REST API | 两者都适合，Express 内置路由更方便 |
| 需要大量自定义中间件 | Koa 的异步洋葱模型便于包装下游逻辑 |
| 团队已有成熟 Express 项目 | 优先复用现有生态和基础设施 |
| 团队已有 Egg 项目 | 可以继续使用基于 Koa 的技术体系 |
| 新建复杂企业级后台 | 可以进一步比较 NestJS、Egg 等上层框架 |

如果面试官问：“Koa 比 Express 性能好吗？”

可以回答：

不能仅根据框架判断。Koa 核心更轻量，但真实接口性能还取决于中间件数量、数据库、缓存、业务逻辑和 Node.js 运行环境，需要在相同条件下压测。

六、最终背诵版（60 秒）

Express 和 Koa 都是 Node.js Web 框架。

Express 提供了路由、中间件和请求响应处理等能力，生态成熟，适合快速开发 Web 服务。

Koa 的核心更轻量，最大的特点是基于 async/await 的洋葱模型。

两者最重要的区别在于中间件执行机制。

Express 通过 next() 推进中间件，但不能直接通过 await next() 等待下游异步业务完成。

Koa 的 next() 会返回下游执行的 Promise，因此可以通过 await next() 等待下游完成，再执行后置逻辑，非常适合统一日志、耗时统计和异常处理。

另外，Express 内置路由，而 Koa 通常需要额外引入路由库。Express 使用 req、res，Koa 则通过 ctx 封装请求和响应。

在实际选型中，我会结合现有技术栈、团队熟悉程度和业务需求，而不是单纯比较哪个框架更好。

记住这道题最重要的三个知识点：next() 和 await next() 的区别、洋葱模型的执行顺序，以及异步异常如何处理。 这三个问题能够回答清楚，基本就能应对 Koa 与 Express 的常见面试追问。
