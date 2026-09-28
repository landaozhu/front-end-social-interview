# SSR 有什么优缺点？和 CSR 怎么选？

25k 一面过关线：能说出 **SSR 换的是首屏 HTML 和 SEO，不是把整个 App 搬到服务端**；优缺点要能对上 **FCP vs TTI、服务器成本、同构坑**；追问能分清 **什么页该 SSR、什么页 CSR 就够**，并挂上携程地图那次。只报「利于 SEO、首屏快」不够。

请求放哪一层见 [ssr请求时机](./ssr请求时机.md)。和 CSR 的链路、hydrate、指标深挖见 [SSR和CSR](../对比题/SSR和CSR.md)。本题只讲 **要不要 SSR、代价是什么**。

---

## 开口（40 秒）

CSR：浏览器先拿到空壳 HTML，再下 JS、拉接口、才出内容。FCP 慢，爬虫也难看正文。

SSR：Node 收到请求后把组件 render 成 **带数据的 HTML** 再下发。用户和爬虫第一眼就是内容，JS 到来后 **hydrate** 接事件，变成能点的 SPA。

换来的是首屏和 SEO；付出去的是 **每请求都要服务端算一遍**、代码必须同构（没有 `window`）、hydrate 还可能对不齐。不是所有页都值得上。

---

## 优点

| 点 | 实际换到什么 |
|----|----------------|
| **首屏有内容** | HTML 里已有列表/价格，FCP / LCP 比空壳 CSR 好（弱网更明显） |
| **SEO** | 爬虫拿得到正文。SPA 的 SEO 问题，一面标准答就是 SSR / 同构（阿里面过） |
| **分享/OG** | 标题、描述、首图在 HTML 里，不用等客户端再改 |
| **和 BFF 配套** | 服务端一次聚合再 render，少一次浏览器 waterfall |

携程酒店地图列表：SSR 预取酒店和价格 + BFF 批量，首屏大约 **4s→2s**。这是优点落地，不是框架口号。

---

## 缺点

| 点 | 为什么痛 |
|----|----------|
| **TTFB / 机器成本** | 每个 URL 都要 Node render，流量大要缓存或扩容；不如静态 HTML 吃 CDN |
| **TTI 不一定更好** | 先出画面，事件仍要等 JS + hydrate。看起来有了，点了没反应 |
| **同构复杂** | 服务端无 `window` / `document`。地图 SDK 必须客户端再 init |
| **hydration mismatch** | 两端第一遍 render 不一致就警告甚至抽空重绘。数据必须是服务端下发的那份 |
| **缓存难** | 登录态、个性化、实时价很难整页 CDN；往往 HTML 缓存 + 客户端再补价 |
| **开发/排查成本** | 一套代码跑 Node 和浏览器，错误栈、生命周期都要分环境 |

React 18 的流式 SSR / `renderToPipeableStream` 能边算边吐 HTML，缓解 TTFB，但同构和 hydrate 问题还在。

---

## 和 CSR / SSG 怎么选

| | 适合 |
|--|------|
| **SSR** | 首屏要被看见或被搜到：酒店列表、商详、活动落地页 |
| **CSR** | 登录后的中后台、强交互编辑器、SEO 无意义 |
| **SSG / 预渲染** | 文档、营销静态页，构建时出 HTML，运行时不再 render |

不是 Vue / React 谁才能 SSR。Vue 有 `onServerPrefetch`，React 有 `renderToString` / Next `getServerSideProps`。选型看 **页面要不要「第一个字节就是内容」**。

猫眼选座偏交互和登录后流程，主路径可以 CSR + 性能优化；Trip.com 地图列表要国际化和首屏，才上 SSR。按页选，不要站队。

---

## 追问

- **SSR 一定更快？** 只保证「更早有内容」。机器慢、render 重，TTFB 可能比 CSR 空壳还差。要测 FCP / LCP / TTI，不要只说 SSR 快。
- **hydrate 是什么？** 浏览器用已有 HTML，把事件和 Fiber/组件树接上，尽量不拆掉重造 DOM。对不齐就会扔了重绘。
- **为什么地图不能 SSR？** Google Map / Mapbox 依赖 `window`。HTML 出列表和价签；地图 **dynamic import，hydrate 后再 init**。
- **和 CSR 比 SEO？** CSR 默认爬虫只见到空壳（除非它执行 JS，不可控）。SSR / 预渲染才是前端常规解。
- **Next / Nuxt 是不是 SSR？** 框架帮你把「请求里 render、数据怎么灌进 HTML」包好了。原理还是这一套，不是另一种渲染。
