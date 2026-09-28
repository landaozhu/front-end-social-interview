## 汇总

- [手写 eventEmitter](../handwritten/eventEmitter/eventEmitter.md)
- [Nodejs 适用于哪些场景？](#Nodejs-适用于哪些场景？)

## Nodejs 适用于哪些场景？

后端开发，Nodejs 的异步 I/O 天生适合做 Web 高并发。
SSR 开发
BFF 开发，配合 GraphQL 做中间层。
前端基建，Webpack、Gulp、Babel、Jest 等等前端工程化的工具或插件。

2. Nodejs 的事件循环和浏览器有什么区别？
   Node.js 的事件循环和浏览器中的事件循环的区别在于，浏览器的异步任务分为宏任务队列和微任务队列，而 Nodejs 的异步任务分成了 6 个任务队列，按执行顺序分别为：

timers 阶段：处理 setTimeout()和 setInterval()等定时器事件。
I/O callbacks 阶段：处理几乎所有的异步 I/O 回调，例如网络 I/O、文件 I/O 等。
idle, prepare 阶段：这是 Node.js 内部使用的，开发者很少会用到。
poll 阶段：等待新的 I/O 事件，处理已经完成的事件回调。
check 阶段：处理 setImmediate()的回调函数。
close callbacks 阶段：处理一些关闭事件，例如 socket 关闭等。

举个例子：

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 1000);

setImmediate(() => {
  console.log('immediate');
});

console.log('end');
```

输出结果：

```
start
end
immediate
timeout
```

再来一个复杂的例子：

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
  process.nextTick(() => {
    console.log('nextTick');
  });
}, 1000);

setImmediate(() => {
  console.log('immediate');
});

const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('readFile');
  setImmediate(() => {
    console.log('immediate in readFile callback');
  });
  setTimeout(() => {
    console.log('timeout in readFile callback');
  }, 0);
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');
```

输出如下：

```
start
end
nextTick
readFile
nextTick
immediate
immediate in readFile callback
timeout in readFile callback
timeout
nextTick
```

分析一下整个代码在事件循环的六个阶段中的执行顺序：

timers 阶段：在该阶段中，执行了由 setTimeout 方法产生的回调函数，输出 timeout，并在回调函数中注册了一个 process.nextTick 方法产生的回调函数。
I/O callbacks 阶段：执行 fs.readFile 方法的回调函数，输出 readFile，并在回调函数中注册了一个 setImmediate 和一个 setTimeout 方法产生的回调函数。
idle, prepare 阶段：没有任务执行。
poll 阶段：处理 setImmediate 方法产生的回调函数，输出 immediate 和 immediate in readFile callback。然后处理由 fs.readFile 方法产生的 setTimeout 方法回调函数，输出 timeout in readFile callback。
check 阶段：在该阶段中，执行由 process.nextTick 方法产生的回调函数，输出 nextTick 和 nextTick。
close callbacks 阶段：没有任务执行。

3. 讲一下 EventEmitter？
   EventEmitter 经常在面试的时候会要求手写，因为这玩意用途实在是太广了。比如在 Vue 里面的 EventBus 实现组件通信，其核心就是 EventEmitter。
   Node.js 的大多数核心模块都是基于 EventEmitter 实现的，如 http、net、fs，很多第三方库也是基于 EventEmitter 实现的，如 socket.io、nodemailer、cheerio 等。
   使用 EventEmitter 的好处是可以用事件的形式来处理异步任务，可以大大简化代码，并且容易处理异常。
   举个例子来看看为什么 Nodejs 里大多数模块都要继承 EventEmitter。
   这是不使用 EventEmitter 实现的文件读取，所有逻辑都放在一个回调函数里：

```javascript
const fs = require('fs');

fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error(`Failed to read file: ${err}`);
  } else {
    console.log(`File content: ${data}`);
  }
});
```

这是使用 EventEmitter 的文件读取：

```javascript
const fs = require('fs');

const stream = fs.createReadStream('file.txt');

stream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});

stream.on('end', () => {
  console.log('Finished reading file.');
});
```

很显然，使用 EventEmitter 之后，处理文件和处理异常的逻辑就被分开了，代码可读性和可维护性都提升了。

4. Buffer 怎么理解，有什么应用？
Buffer 对象是一个类似于数组的对象，它的每个元素都是一个表示 8 位字节的整数。
可以将其看作是一个字节数组，用来存储和操作二进制数据。
应用场景：

网络通信：可以使用 Buffer.from()方法将字符串转换为二进制数据，然后使用 net 模块进行网络通信：

```javascript
const net = require('net');

const client = net.createConnection({ port: 8080 }, () => {
  // 将字符串转换为二进制数据
  const data = Buffer.from('Hello, world!', 'utf8');

  // 发送数据
  client.write(data);
});
```

文件操作，用 Buffer 来存储文件数据：

```javascript
const fs = require('fs');

// 读取文件，并将数据存储到 Buffer 对象中
const data = fs.readFileSync('/path/to/file');

// 处理数据
// ...
```

加密解密，例如，可以使用 crypto 模块创建加密解密算法需要的二进制数据：

```javascript
const crypto = require('crypto');

// 创建加密解密算法需要的二进制数据
const key = Buffer.from('mysecretkey', 'utf8');
const iv = Buffer.alloc(16);

// 创建加密解密算法对象
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

// 加密数据
const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
```

图像处理：

```javascript
const fs = require('fs');
const sharp = require('sharp');

// 读取图片文件，并将数据存储到 Buffer 对象中
const data = fs.readFileSync('/path/to/image');

// 处理图片
sharp(data)
  .resize(200, 200)
  .toFile('/path/to/resized-image', (err, info) => {
    // ...
  });
```

5. 什么是 I/O？
   概念：计算机里所谓的 I/O 指的是输入和输出，但对于前端同学而言，这个定义可能不太好理解。简单点说，需要等待的任务都可以称为 I/O 任务，比如前端的事件处理、网络请求、定时器，后端的文件处理、网络请求、数据库操作，这些都属于 I/O 任务。
   异步 I/O：以网络请求任务为例，传统的同步 I/O 指的是一个一个排队执行，一个执行完了再执行下一个，即使线程空闲，也不能执行其他任务。
   而异步 I/O 会返回一个标记，告诉调用者 I/O 操作已经开始，但不会阻塞线程。当 I/O 操作完成时，会调用注册的回调函数，将结果返回给调用者。
   异步 I/O 使得程序在执行 I/O 操作时不必等待，提高了程序的并发性能。
   听起来异步 I/O 很好，那为什么同步 I/O 依然会存在

传统的同步 I/O 操作比异步 I/O 操作更容易理解和编写。异步编程需要开发人员具备较高的技能水平，以及对事件循环、回调函数等概念的深入理解。
对于某些小规模的应用程序或者一些低频次的 I/O 操作，使用异步 I/O 可能不会带来很大的性能提升，而且可能会增加代码的复杂性。
对于一些 CPU 密集型任务，传统 I/O 操作可能比异步 I/O 更快，因为异步 I/O 会在 I/O 操作执行期间增加额外的上下文切换和事件处理负担，从而降低了程序的性能。

CPU 密集和 I/O 密集：

CPU 密集任务指的是纯计算任务。
I/O 密集的任务指的是需要等待的任务。所谓的高并发，显然属于 I/O 密集型任务。

6. 讲一下常见的 Nodejs 框架？

Koa：一个轻量的 Nodejs 框架，代码非常简洁。采用洋葱圈模型中间件，非常方便扩展功能，但是开发后端 API 需要进行再封装。

Express：Express 也是一个轻量框架，Express 和 Koa 的区别在于中间件机制。但总体差别不是很大，绝大多数 Nodejs 框架都是在 Koa 或者 Express 基础上封装的。

Eggjs：基于 Koa 封装的框架，整合了数据库、路由、安全防护、日志记录、异常处理等中间件，可以用来快速开发 Rest 或者 Restful API 项目。

Nestjs：基于 TS,使用了大量的装饰器语法，开发体验类似于 Java 的 Springboot。除此之外，Nestjs 还提供了 GraphQL、WebSocket、各种 MQ 和微服务的解决方案，比较适合大型后端项目的开发。

7. Koa 中间件原理了解吗？
   Koa 洋葱圈中间件实现原理主要有以下两点：

数组里面存函数：使用 middleware 来存储中间函数。

```javascript
use (fn) {
  if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
  debug('use %s', fn._name || fn.name || '-')
  this.middleware.push(fn)
  return this
}
```

compose 函数：将一组中间件函数组合成一个大的异步函数。这个大的异步函数会依次执行每个中间件函数，并将每个中间件函数的执行结果传递给下一个中间件函数。最终，这个大的异步函数会返回一个 Promise 对象，表示整个中间件链的执行结果。

```javascript
function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    let index = -1
    return dispatch(0)

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

8. 什么是 Stream 流，有哪些应用场景？
   Stream 是一种处理流式数据的抽象接口，用于读取、写入、转换和操作数据流。它是一个基于事件的 API，可以让我们以高效、低延迟的方式处理大型数据集。
   说直白点就是基于 Stream 封装的 API，性能更好。
   比如读取文件，使用流我们可以一点一点来读取文件，每次只读取或写入文件的一小部分数据块，而不是一次性将整个文件读取或写入到内存中或磁盘中，这样做能够降低内存占用。
9. 什么是 BFF？
   BFF（Backend For Frontend）,说白了就是中间层，由前端同学开发的后端项目。
   最常见的 BFF 项目像 SSR 和 GraphQL。SSR 用来解决 SEO 问题，GraphQL 用来聚合数据，解决 API 查询的问题。
10. 什么是 ORM？Nodejs 的 ORM 框架有哪些？
    ORM 框架是通过对 SQL 语句进行封装，并将数据库的数据表和用户代码里的模型对象进行自动映射。
    这样开发者使用时只需要调用模型对象的方法就能实现对数据库的增删改查，不用手写太多的 SQL 了。
    Node.js 中比较流行的 ORM 框架有：

Sequelize：基于 JS，在 Koa、Express、Egg 这样的框架里操作数据库用 Sequelize 比较多，当然 Sequelize 经过一定扩展也可以支持 TS。

TypeORM：基于 TS，Nest 框架首选 TypeORM。

11. 有没有了解过 Redis？
    可以从以下方面来回答：

用 Redis 实现缓存：将热门数据和热门页面存到 Redis 进行缓存，比如热门商品信息，商品页面和网站首页。
缓存遇到的问题：缓存穿透、缓存雪崩、缓存击穿。
Redis 的进阶功能：Redis 有各种数据结构，除了缓存之外，还能实现很多功能。比如：消息队列、附近的人、排行榜等等。
Redis 持久化：Redis 可以将缓存持久化到本地，持久化策略包括 RDB 和 AOF。
集群：如果单机 Redis 不够用的话，可以考虑搭建 Redis 集群，Redis 集群有主从和哨兵两种模式。

Redis 对于后端来说，是一个专门的话题，我将会在我的后端面试手册中详细讲解，感兴趣的小伙伴可以持续关注。 12. 有没有做过数据库优化？
常见的优化有：

使用 explain 执行计划查看 SQL 的执行信息，进而定位慢 SQL 来源。
索引是 Mysql 调优首先能想到的方案，合理设置索引可以很大程度上提高查询效率。
大分页也是一个常见的性能问题出现的地方，因为 MySQL 需要扫描大量的数据，造成性能瓶颈。可以通过使用主键或者游标分页的方式来优化。
读写分离，单机顶不住的时候，可以使用主从架构，把数据库读写分担到不同的机器上。
分库分表，如果数据表存了海量数据，除了读写分离之外，还要考虑分库分表，把一张表分成多张表，减轻数据库压力。

数据库优化也是一个很大的话题，此处仅作简要总结，后续会出文章详解。 13. 有了解过分布式和微服务吗？
当单体应用撑不住的时候，就得考虑上集群，把应用部署在多个机器上，就形成了分布式架构。
分布式的集群不仅带来了算力和并发能力，也带来了各种问题，这其中包括：分布式通信、分布式事务、分布式 id、分布式容错、负载均衡等。
所以就需要有各种中间件来解决这些问题，比如 Nginx、Zookeeper、Dubbo、MQ、RPC 等。
然后当项目规模进一步扩大的时候，不仅要考虑集群，还要考虑项目的拆分，这时候就要上微服务架构了。把一个大项目根据业务拆分成很多功能单一的模块，可以由不同的团队独立开发和部署。
比如一个电商的后台 API，可以拆分成用户服务、商品服务、订单服务、优惠券服务、广告服务，这些服务由不同的团队去维护。
当然，微服务也带来了更多的复杂性，所以就会有像 Spring Cloud、Spring Cloud Alibaba 这样的解决方案去解决这些复杂性。
关于分布式和微服务更深入的问题，后续我也将在我的后端面试手册中一一讲解，敬请期待。

作者：平平无奇古哥哥
链接：https://juejin.cn/post/7236325900719783995
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

参考链接：
https://juejin.cn/post/7236325900719783995?searchId=20230808172017D8BC6CC63C6B41AD1D6C
牛客面经的收集
