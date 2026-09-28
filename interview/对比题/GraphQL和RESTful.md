# GraphQL 和 RESTful API 有什么区别？

25k 一面过关线：能说出 **REST 是资源 + HTTP，GraphQL 是 Schema + 一次查询描述形状**；过取/欠取、缓存、版本、错误码都能对上；追问能讲 **N+1 / DataLoader、为什么 POST 不好走 CDN、GraphQL 当 BFF 和 REST 聚合怎么选**。只说「GraphQL 一次拿齐、REST 过时」过不了。

配套：BFF 聚合见 [为什么要用bff层](../node/为什么要用bff层.md)。GraphQL 是 BFF 的一种实现，不是 BFF 本身。

---

## 开口（40 秒）

REST：按 **资源** 拆 URL，用 GET/POST/PUT/PATCH/DELETE 表达动作。客户端调什么接口、返回什么字段，基本由服务端 DTO 定死。一页要列表 + 价格 + 用户，常常打 N 个接口。

GraphQL：服务端暴露一张 **类型图（Schema）**，通常一个入口（如 `POST /graphql`）。客户端用查询语句声明「要哪些类型、哪些字段、嵌套哪一层」，一次拿回刚好的 JSON。

两者都是 API 风格。**差在数据形状由谁定、一次往返拿多少、HTTP 缓存和版本怎么走。** 不是新协议一定更高级。

简历：猫眼 Egg 中间层、携程 Java BFF 都是 **REST 聚合**，不是 GraphQL。GraphQL 适合「多端要的字段差很多、查询是图状」；页面固定、CDN 缓存重、团队已有 REST，继续 REST 更常见。

---

## 核心对比

| | REST | GraphQL |
|--|------|---------|
| 模型 | 资源 + URL + HTTP 方法 | Schema（类型、Query/Mutation/Subscription） |
| 入口 | 多个 endpoint | 通常一个 `/graphql` |
| 形状谁定 | 服务端 DTO | 客户端选字段，服务端用 Resolver 填 |
| 过取 / 欠取 | 常见：字段太多或不够再打第二个接口 | 减少过取；嵌套一层层解析仍可能 N+1 |
| 缓存 | GET + URL，CDN / ETag / 协商缓存天然 | 单 URL + 常 POST，HTTP 缓存弱；靠 persisted query、客户端归一化缓存 |
| 版本 | `/v1` `/v2` 或新资源 | 加字段、`@deprecated` 演进，少整版号 |
| 错误 | HTTP status 表达成败 | 常 **HTTP 200 + `errors[]`**，业务失败不走 4xx |
| 文件上传 | `multipart/form-data` 自然 | 要额外约定（如 graphql-multipart） |
| 实时 | 另开 WebSocket / SSE | Subscription（仍是 WS） |
| 文档 | Swagger / OpenAPI | Schema 即文档，可 GraphiQL 自省 |

一句话：**REST 把「怎么取」写在 URL 上；GraphQL 把「取什么」写在查询里。**

---

## 分点

### （1）过取和欠取（面试最爱问）

酒店列表页只要 `id、name、price、star`。REST `/hotels/:id` 可能带回 80 个字段（过取）；价格若在另一个 `/hotels/:id/price`，又要再打一次（欠取 → waterfall）。

GraphQL 可以写成：

```graphql
query HotelList($ids: [ID!]!) {
  hotels(ids: $ids) {
    id
    name
    star
    price { amount currency }
  }
}
```

H5 只要这些；PC 再加 `facilities`，改查询即可，不一定新开 REST 接口。

**别说过取从此消失。** 客户端乱写深层嵌套（`user { friends { friends { ... } }`）一样把服务端打爆。要 **深度限制、复杂度/cost、超时、字段白名单**。

### （2）执行模型：Resolver 和 N+1

REST 一个接口内部自己 join/批量查，N+1 是实现问题。GraphQL **每个字段一个 Resolver**， nested 时非常容易 N+1：

```
hotels → 20 条
  └── price → 每条再查一次价 → 20 次
```

标准解：DataLoader（或等价批量）把同一 tick 的 key 收齐，一次批量打下游。讲不清 DataLoader，GraphQL 只背到「一次请求」会被追问打穿。

REST BFF 也可以批量（携程地图围栏价就是 Java BFF 批量，不是 GraphQL）。**聚合能力两者都有，GraphQL 只是把聚合接口做成了可组合查询。**

### （3）缓存：REST 的主场

`GET /hotels/123` 可以 CDN、浏览器强缓存/协商缓存（见 [强缓存和协商缓存](./强缓存和协商缓存.md)）。URL 就是缓存键。

GraphQL 常见是 **同一个 URL + POST body**。CDN 默认不缓存 POST；query 字符串当 GET 又有长度限制。工业界做法：

- **Persisted Query**：预存查询哈希，GET `?queryHash=`，才能进 CDN
- 客户端 Apollo/urql：**按 `__typename + id` 归一化缓存**，和 HTTP 缓存是两层
- 可变价、登录态同样不能整页乱缓存——和 SSR 个性化 HTML 是同一类问题

所以「GraphQL 更快」不成立。少 RTT 可能更快；打掉 HTTP 缓存、Resolver N+1，可能更慢。

### （4）版本、错误、鉴权

版本：REST 改字段容易破坏老客户端，才有 v1/v2。GraphQL 加字段老查询不受影响，删字段要 deprecate 再给迁移期。两边都能做坏：REST 也可以只加字段不改版本；GraphQL 乱 rename 一样炸。

错误：REST `404`/`401`/`409` 语义清楚，网关、监控按 status 告警。GraphQL 传输层常 200，业务错误在 `errors`，**监控、网关限流、浏览器对 4xx 的处理都要自己接**。部分实现用 4xx/5xx 表示语法/鉴权失败，开口时别说死。

鉴权：REST 按路径/方法；GraphQL 还要 **字段级授权**（能查 `hotel.name` 不能查 `hotel.internalCost`）。只在入口验登录不够。

### （5）和 BFF、微服务怎么串

微服务拆完，前端一页要打很多服务 → 才要 BFF。

| | REST BFF | GraphQL BFF |
|--|---------|-------------|
| 做法 | 为页面写聚合接口，DTO 按端裁 | Schema 暴露图，端自己挑字段 |
| 适合 | 页面少、形状稳、要吃 HTTP 缓存 | 端多、字段差、查询组合多 |
| 代价 | 每新页面可能新接口 | Schema 治理、N+1、缓存、复杂度限制 |

猫眼中间层、携程酒店 BFF：**页面形状相对固定、要批量和下沉价格**，REST 聚合更直接。没有为了「更现代」上 GraphQL。

GraphQL 也不是必须当前端直连微服务。多数公司仍是 **GraphQL 网关/BFF → 下游 REST/gRPC**。

---

## 怎么选

| 用 REST | 用 GraphQL |
|---------|------------|
| CRUD、资源边界清楚 | 多端（H5/PC/App）要的字段差很多 |
| 要 CDN / GET 缓存 | 图状查询（用户→订单→商品）且组合不稳定 |
| 文件上传、网关/监控按 HTTP status | 前端能改查询、减少后端为每个页面开接口 |
| 团队和下游全是 REST，迁移成本高 | 有人专职治理 Schema，能上 DataLoader 和限流 |

不要站队。同一系统也可以：**对外 REST，BFF 对内再 GraphQL**，或反过来。

---

## 追问

**Q：GraphQL 一次请求是不是一定更快？**  
A：少 RTT、少过取可能快。Resolver N+1、POST 吃不到 CDN、查询过深，可能更慢。要测。

**Q：N+1 是什么？怎么解？**  
A：父列表 20 条，子字段各查一次。DataLoader 把 key 合并成一次批量。REST 接口内部 join 也是同一类优化。

**Q：为什么 GraphQL 不好缓存？**  
A：单 endpoint + POST，URL 不能当缓存键。Persisted Query 或客户端归一化缓存。可变价照样不能乱缓存。

**Q：错误为什么经常是 200？**  
A：协议把「查询能 parse/执行」和「业务字段失败」分开。监控不要只看 HTTP status，要看 `errors`。

**Q：和 BFF 什么关系？**  
A：GraphQL 常拿来当 BFF 的查询面。BFF 也可以是 REST 聚合。携程/猫眼中间层是后者。

**Q：Subscription 和 REST 实时？**  
A：都是 WebSocket/SSE 那一层。GraphQL 只是用 Schema 订一份数据变化，不是另一种传输。

**Q：Mutation 和 POST 一样吗？**  
A：都是写。GraphQL Mutation 仍走同一个 endpoint，幂等、事务、副作用要自己设计，没有 REST 那种「GET 安全、PUT 幂等」的约定那么强。

**Q：要不要替换你们现有 REST？**  
A：页面稳、缓存和网关已按 REST 建好，不换。多端字段差、后端排期跟不上页面，才评估 GraphQL BFF，并算 Schema 和 N+1 的成本。
