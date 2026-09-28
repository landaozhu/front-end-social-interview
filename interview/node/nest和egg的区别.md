NestJS vs Egg.js：25K 前端 / Node.js 面试回答

这道题在中大厂面试中，不能只回答“一个是 TypeScript 框架，一个是阿里框架”。面试官真正想考察的是：你是否理解 Node.js 服务端框架的架构设计、依赖注入、插件机制，以及如何根据业务复杂度进行技术选型。

尤其是你有 Egg.js 开发经验，又准备使用 NestJS 开发电商后台，可以把这道题回答成一次从传统 Node.js 后端架构向模块化架构演进的技术选型。

一、面试官问：NestJS 和 Egg.js 有什么区别？
1. 先给出核心回答（约 2 分钟）

NestJS 和 Egg.js 都是 Node.js 服务端框架，都可以用于开发 REST API、后台管理系统和复杂业务服务，但两者的架构设计理念不同。

Egg.js 更偏向约定式、插件化的企业级框架，而 NestJS 更偏向模块化、依赖注入和面向对象的应用架构。

Egg.js 基于 Koa，采用 Controller、Service 等分层结构，通过约定目录组织代码，并使用插件机制扩展数据库、日志、缓存等基础能力。

NestJS 默认基于 Express，也支持切换到 Fastify。它以 Module 为组织单位，通过 Controller 处理请求、Provider 封装业务能力，利用依赖注入管理对象之间的关系，并提供 Guard、Pipe、Interceptor、Exception Filter 等机制处理横切逻辑。

我认为，两者最大的区别并不在于能否实现某个功能，而在于如何组织复杂业务，以及如何管理模块之间的依赖关系。

对于已经有成熟 Egg.js 基础设施的团队，继续使用 Egg.js 可以减少迁移成本；对于新建的 TypeScript 项目，特别是模块较多、依赖关系复杂的系统，NestJS 的模块化和依赖注入机制值得考虑。

二、核心区别：从 6 个维度展开

| 对比维度 | Egg.js | NestJS |
|---|---|---|
| 底层 HTTP 框架 | 基于 Koa | 默认 Express，可切换 Fastify |
| 架构理念 | 约定优于配置、插件化 | 模块化、依赖注入 |
| 代码组织 | 传统项目按 Controller、Service 等目录分层 | 通常按业务 Module 组织 |
| 依赖管理 | 传统模式通过 ctx.service 等访问；新版也支持 DI | 以 Provider 和 DI 容器为核心 |
| 横切逻辑 | Koa Middleware、插件等 | Middleware、Guard、Pipe、Interceptor、Filter |
| TypeScript | 支持，具体体验取决于版本和项目 | TypeScript 优先，也支持 JavaScript |

这里有一个容易被面试官追问的细节：不能简单地说 Egg 不支持依赖注入。 Egg 的新版本已经提供依赖注入、AOP 等能力；上表中关于 ctx.service 的描述主要针对传统 Egg 项目。
Egg.js
+3

1. 架构设计：约定式分层 vs 业务模块化

传统 Egg 项目通常采用这样的目录：

```
app/
├── controller/
│   ├── user.js
│   └── order.js
├── service/
│   ├── user.js
│   └── order.js
└── router.js
```

框架通过 Loader 根据目录约定加载 Controller、Service 等对象。

NestJS 更常见的组织方式是：

```
src/
├── user/
│   ├── user.module.ts
│   ├── user.controller.ts
│   └── user.service.ts
├── order/
│   ├── order.module.ts
│   ├── order.controller.ts
│   └── order.service.ts
└── app.module.ts
```

每个业务模块将相关的 Controller、Service、Repository 等组织在一起，并通过 imports 和 exports 管理模块间的依赖。

例如，订单模块需要使用用户服务时，可以由用户模块导出对应 Provider，再由订单模块导入用户模块。

这使得模块对外暴露哪些能力更加明确。
NestJS - A progressive Node.js framework
+1

面试加分点：

两者并不是一个能模块化、另一个不能。Egg 同样可以按照业务域组织目录。

区别在于 NestJS 将模块边界和依赖关系纳入框架的核心机制，而传统 Egg 更多依赖目录约定、Loader 和团队自己的工程规范。

2. 依赖注入：两者最值得深入的区别

这是整道题最有技术含量的部分。

先看传统 Egg 的写法：

```javascript
// app/controller/order.js
const { Controller } = require('egg');

class OrderController extends Controller {
  async detail() {
    const { ctx } = this;

    const order = await ctx.service.order.detail(
      ctx.params.id
    );

    ctx.body = order;
  }
}

module.exports = OrderController;
```

Controller 通过 ctx.service.order 获取业务服务。

再看 NestJS：

```typescript
@Injectable()
export class OrderService {
  async detail(id: string) {
    return { id, status: 'paid' };
  }
}

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.orderService.detail(id);
  }
}
```

并在 Module 中注册：

```typescript
@Module({
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
```

NestJS 会根据注册的 Provider 和依赖信息，解析并注入 OrderService。
NestJS - A progressive Node.js framework
+1

为什么依赖注入有价值？

假设订单服务依赖支付服务：

```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}
}
```

这里的关键不是少写几行代码，而是 OrderService 不需要自己负责创建 PaymentService。

对象的创建和依赖组装交给容器管理。

这带来三个实际收益：

解耦：业务类不必直接创建具体依赖。

可测试：可以通过测试模块替换真实的支付服务。

生命周期管理：容器可以统一管理单例、请求级等不同作用域的 Provider。

例如，测试时可以把真实支付服务替换成 Mock：

```typescript
{
  provide: PaymentService,
  useValue: {
    pay: jest.fn().mockResolvedValue({
      success: true,
    }),
  },
}
```

这样测试订单逻辑时，不需要真的调用第三方支付接口。

面试官问：Egg 能不能做到？

能。传统 Egg 可以使用 egg-mock、手动 Mock 或封装依赖来测试，新版 Egg 也支持依赖注入。

真正的区别是，NestJS 将 DI 容器作为架构核心，提供了比较统一的依赖注册、解析和替换机制，而不是说 Egg 完全没有这些能力。

3. 请求处理：Koa 洋葱模型 vs Nest 请求生命周期

你之前学过 Koa 洋葱模型，这里可以直接关联起来。

Egg 基于 Koa，典型请求过程如下：

```
请求进入
   ↓
Middleware A 前置逻辑
   ↓
Middleware B 前置逻辑
   ↓
Controller
   ↓
Service
   ↓
Middleware B 后置逻辑
   ↓
Middleware A 后置逻辑
   ↓
响应返回
```

中间件通过 await next() 将控制权交给下游，等待下游完成后继续执行后置逻辑。

NestJS 则提供了更细粒度的请求处理机制：

| 机制 | 职责 |
|---|---|
| Middleware | 通用请求预处理、日志、请求上下文 |
| Guard | 判断请求是否有权限继续执行 |
| Interceptor 前置逻辑 | 耗时统计、缓存、响应包装等 |
| Pipe → Controller → Service | 参数转换与校验 → 接口处理 → 业务执行 |
| Interceptor 后置逻辑 | 处理返回结果、记录耗时 |
| Response | 正常返回响应 |
| Exception Filter | 异常路径可由 Exception Filter 处理 |

这是典型 HTTP 请求的简化流程。Exception Filter 不是正常请求必经的一层，而是在异常未被其他逻辑处理时参与异常处理。
NestJS - A progressive Node.js framework
+1

面试官追问：Nest 的 Interceptor 和 Koa Middleware 有什么区别？

它们都能在业务逻辑前后执行代码，但职责和机制不同。

Koa Middleware 使用 await next()，基于 Promise 实现洋葱模型。

Nest Interceptor 使用 next.handle() 获取 Observable，可以通过 RxJS 操作符对后续处理过程进行包装。

例如：

```typescript
@Injectable()
export class LoggingInterceptor
  implements NestInterceptor {

  intercept(context, next) {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(
          `耗时: ${Date.now() - start}ms`
        );
      }),
    );
  }
}
```

如果业务抛出异常，还可以通过 catchError 等操作符处理错误。

这里不要说 Nest 没有洋葱模型。Nest 的 Interceptor 同样支持前置和后置处理，只是它在框架中有独立的抽象和执行机制。

记忆口诀：Middleware 做通用预处理，Guard 做权限判断，Pipe 做参数处理，Interceptor 包装执行过程，Filter 处理异常。

4. 插件机制：Egg Plugin vs Nest Module

Egg 的插件机制是其重要设计之一。

例如，项目需要数据库、Redis、定时任务等能力时，可以通过插件引入并统一配置。

Egg 插件不只是 Koa 中间件，还可以包含 Service、配置、框架扩展以及启动初始化逻辑。
Egg.js
+1

NestJS 则可以通过 Module 封装这些能力：

```typescript
@Module({
  imports: [
    DatabaseModule,
    RedisModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
```

但需要注意：Egg Plugin 和 Nest Module 并不是完全对应的概念。

Egg Plugin 更偏向框架能力扩展和复用，Nest Module 既可以组织业务模块，也可以封装基础设施。

Nest 的动态模块还可以通过 forRoot()、forRootAsync() 等模式接收配置，实现类似插件的可复用能力。

面试时可以这样总结：

Egg 通过插件机制扩展框架能力，Nest 通过 Module 和 Provider 组织业务及基础设施，两者都支持复用，但抽象层次和依赖管理方式不同。

5. TypeScript：为什么 Nest 更适合 TS 优先的项目？

NestJS 使用 TypeScript 构建，框架中的 Module、Controller、Provider、DTO 等概念可以与类型系统、装饰器和依赖注入结合。
NestJS 中文文档
+1

例如，定义创建订单的 DTO：

```typescript
export class CreateOrderDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
```

Controller：

```typescript
@Post()
create(@Body() dto: CreateOrderDto) {
  return this.orderService.create(dto);
}
```

配合 ValidationPipe，可以在运行时校验请求参数。

但这里有个面试陷阱：

TypeScript 类型检查不等于运行时参数校验。

CreateOrderDto 的 TS 类型只能在编译阶段提供约束。真正校验用户传入的数据，还需要 class-validator、ValidationPipe 等运行时机制。

Egg 同样可以使用 TypeScript 和参数校验库，因此这不是 Nest 独有的能力，而是 Nest 提供了比较统一的集成方式。

6. 性能：Nest 一定比 Egg 快吗？

不一定。

Egg 基于 Koa，Nest 默认使用 Express，也可以切换 Fastify。Nest 的官方文档也明确提供了 Fastify 适配方案。
docs.nestjs.cn
+1

但不能仅凭底层 HTTP 框架，就断言整个业务系统的性能高低。

例如，一个电商订单接口可能涉及：

```
HTTP 请求
   ↓
参数校验
   ↓
查询 MySQL
   ↓
查询 Redis
   ↓
调用库存服务
   ↓
返回结果
```

如果数据库查询需要 100ms，而框架处理只需要几毫秒，那么优化 SQL、索引和缓存可能比更换 HTTP 框架更有价值。

另外，Nest 默认的单例 Provider 不会因为依赖注入就在每次请求时重新创建。只有使用请求级作用域等机制时，才需要额外关注对象创建和依赖解析成本。

面试回答：

框架性能要结合真实业务压测，关注吞吐量、P95/P99 延迟、CPU、内存和数据库耗时，而不能简单认为 Nest 或 Egg 天然更快。

三、场景题：如果让你做一个电商后台，你会怎么选？

假设系统包含商品、订单、库存、支付、用户和 AI 购物助手。

电商系统架构示例

```
React / Next.js / React Native
Web 管理后台、商城及 App
        ↓
NestJS 业务后端
  ├── User Module
  ├── Product Module
  ├── Order Module
  ├── Payment Module
  ├── Inventory Module
  └── AI Module
        ↓
MySQL / Redis（持久化与缓存）
Python AI Service（LangChain / 模型调用）
```

示意架构：模块划分不代表必须拆分成多个微服务。

对于这样的新项目，我会考虑 NestJS，主要有三个原因。

第一，业务模块比较多，可以按领域组织 Module，并明确模块之间的依赖关系。

第二，订单、支付、库存之间存在复杂依赖，可以通过 Provider 和依赖注入进行管理，方便单元测试和后续替换实现。

第三，项目采用 TypeScript，可以统一 DTO、接口定义和部分类型约束，减少前后端协作中的类型不一致问题。

不过，如果公司已有成熟的 Egg 技术体系，包括统一鉴权、日志、监控、数据库插件和部署流水线，我不会仅仅因为 Nest 的架构更符合个人习惯就推动迁移。

我会优先评估现有系统的维护成本、团队熟悉程度、迁移风险和业务收益。

技术选型不是选择功能最多的框架，而是选择在当前业务和团队条件下综合成本更合适的方案。

四、面试官可能继续追问的 5 道题

1. NestJS 的依赖注入底层是怎么实现的？

Nest 在启动时扫描 Module 的元数据，构建模块和 Provider 的依赖关系，再通过 DI 容器解析依赖并创建实例。默认 Provider 是单例作用域。需要注意，TypeScript 的 interface 在运行时会被擦除，因此注入接口对应的实现通常需要使用自定义 Token 和 @Inject()。

2. NestJS 和 Spring Boot 有什么相似之处？

3. NestJS 的 Provider 默认是单例吗？

4. NestJS 适合微服务吗？

5. 如果已有 Egg 项目，是否值得迁移到 Nest？

五、最终背诵版（60 秒）

NestJS 和 Egg.js 都是 Node.js 服务端框架，但架构理念不同。

Egg 基于 Koa，传统项目采用约定式目录和 Controller、Service 分层，通过插件机制扩展数据库、缓存、日志等能力。

Nest 默认基于 Express，也支持 Fastify，核心是 Module、Provider 和依赖注入。它通过 Module 管理业务边界，通过 DI 容器管理对象依赖，并通过 Guard、Pipe、Interceptor 等机制处理鉴权、参数校验和横切逻辑。

我认为最大的区别是依赖管理和模块组织方式。传统 Egg 更多依赖框架约定和上下文访问服务，而 Nest 将依赖关系显式地交给容器管理，方便测试和模块复用。当然，新版 Egg 也已经支持依赖注入，不能简单认为 Egg 没有这些能力。

如果是新建的 TypeScript 电商后台，我会考虑 Nest；如果公司已经有成熟的 Egg 技术体系，我会优先考虑现有基础设施和迁移成本，而不是为了换框架而换框架。

这道题最值得深入准备的是依赖注入、Module 和请求生命周期。 如果面试官继续追问，你能解释清楚 DI 容器如何创建对象、Module 如何控制 Provider 的可见性，以及 Interceptor 和 Koa 洋葱模型的区别，就能把回答从框架使用层面延伸到架构设计层面。
