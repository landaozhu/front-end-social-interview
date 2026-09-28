# SSR 和 CSR 有什么区别？

30k 过关线：能画出 **两条完整链路（含数据、JS、hydrate）**；指标要拆 **TTFB / FCP / LCP / TTI**，不能说「SSR 更快」；深挖必须接得上 **hydration mismatch 的根因、状态怎么注水、为什么 TTI 可能更差、地图为什么不能 SSR**。只背优缺点表，按 25k 都偏浅。

配套：要不要上、代价见 [SSR优缺点](../react/SSR优缺点.md)；数据放哪一层见 [ssr请求时机](../react/ssr请求时机.md)。本题是 **对比 + 深挖**。

---

## 1. 背景：两种模式在解决什么

都是「组件 → 页面」，差在 **第一次 HTML 里有没有内容、数据在哪台机器上拉**。

CSR（Client-Side Rendering）：服务器几乎只吐一个壳（`<div id="root">` + script）。浏览器下载 JS、执行、再请求接口、再往空节点里画。典型 SPA。

SSR（Server-Side Rendering）：**每个（或每个需要的）URL 在 Node 里把组件跑一遍**，输出已经带列表/价格/标题的 HTML。浏览器先看见内容，再下载同一套 JS，把事件和状态接上去（hydrate），后面的跳转仍可以当 SPA。

不是「SSR 把 React 搬到服务器就结束」。没有 hydrate，页面能看不能点；没有把数据序列化进 HTML，客户端会再拉一遍，首屏白了半截。

简历：Trip.com 酒店地图列表走 SSR；猫眼选座偏 CSR + 首屏优化。按页选，不站队。

---

## 2. 整体：两条链路（先把图说完）

```
CSR
  请求 HTML（空壳，TTFB 通常短）
    → 下 JS（体积/缓存是瓶颈）
      → 执行 JS，挂 root
        → 再请求接口（浏览器 waterfall）
          → setState 出 DOM（这时才有 FCP/LCP）
            → 可交互（TTI）

SSR
  请求打到 Node
    → 鉴权 / 路由 / 拉首屏数据（BFF 更好）
      → renderToString 或流式 render（CPU，TTFB 含这一段）
        → HTML 已有内容 + 序列化后的 state 下发
          → 浏览器解析 HTML（FCP/LCP 可以较早）
            → 下 JS
              → hydrate：对已有 DOM 建 Fiber，绑事件（CPU，这时才 TTI）
                → useEffect：Map、window、二次数据
```

CSR 的 TTFB 好看，是因为服务器几乎没干活；用户却要等 JS + 接口。SSR 把「等接口」和「第一次画」前移到 Node，用户更早看见字，但 **Node 变慢会直接打进 TTFB**，且 **能点仍要等 JS + hydrate**。

下面按面试会深挖的点拆。

---

## 3. 分点

### （1）指标：谁快，快在哪

| 指标 | CSR | SSR | 别说错 |
|------|-----|-----|--------|
| TTFB | 往往更短（静态壳、CDN） | 含 Node 拉数 + render，可能更长 | SSR 不保证 TTFB 更好 |
| FCP / LCP | 等 JS + 接口之后 | HTML 里已有正文/图，通常更早 | 弱网差更明显 |
| TTI / INP | JS 执行完就能绑事件 | **hydrate 跑完**才能点 | SSR 可能「看得见点不了」更久 |
| SEO / OG | 空壳；爬虫执行 JS 不可控 | 源码里就是正文和 meta | 社交分享看的是原始 HTML |

30k 补一句：**SSR 换的是「更早有内容」，不是「整条链路都更快」。** 列表很大时 hydrate 会扫整棵树，TTI 可能比精心分包的 CSR 更差。要测，不要口号。

携程地图：瓶颈是地图资源 + 价格 waterfall。SSR 预取酒店/价格 + BFF 批量，首屏大约 **4s→2s**（业务首屏/实验室，开口说明口径）。地图本身不进 SSR。

### （2）Hydrate：SSR 真正变成 SPA 的那一步

hydrate 不是再 `innerHTML` 一遍。浏览器用 **已经存在的 DOM**，按组件树对上 Fiber，挂事件。React 18 用 `hydrateRoot`；还在 `ReactDOM.hydrate` / `render` 是旧入口。

**必须和服务器第一遍 render 的输出一致**（同一份 props/state、同一套组件）。对不齐：开发环境警告，严重时客户端丢掉服务端 DOM 整树重绘——SSR 白做，还多一次闪。

深挖时 mismatch 常见根因（要能举得出）：

1. **两端算的值不一样**：`Date.now()`、`Math.random()`、`toLocaleString()`（时区/locale）、`typeof window` 分叉导致少渲染一块
2. **无效 HTML 被浏览器改树**：`<p>` 里塞 `<div>`、`<table>` 结构不对，服务端字符串和浏览器 parse 后对不上
3. **空白 / 注释 / 第三方插件改 DOM**：翻译插件、密码管理器插节点
4. **CSS-in-JS class 对不上**：服务端和客户端生成的 hash 不一致
5. **数据又拉了一遍**：没用下发的 JSON，客户端 `useEffect` 再请求，第一帧和 HTML 不同

做法：首屏数据 **serialize 进 HTML**（`window.__PRELOADED_STATE__` / Next 的 JSON 脚本），客户端用这份 hydrate，不要重新算。非法 HTML 不要写。确实只能客户端才有的（地图），用 `suppressHydrationWarning` 只罩极小文本节点，或 **占位 + hydrate 后再 mount**，不要整页糊弄。

`useEffect` / `componentDidMount` **只在客户端跑**，服务端没有。用它们拉首屏 = HTML 仍是空的，SSR 名存实亡。见请求时机那篇。

### （3）数据、同构、BFF

同构 = 同一套组件在 Node 和浏览器都能跑。服务端没有 `window` / `document` / `localStorage`。

- 鉴权：SSR 只能读 **这次请求带上来的 Cookie / Header**，转发给 BFF。Token 只在 `localStorage` 里，Node 拿不到，首屏会当游客。
- 拉数：render 前在 Node 拉；BFF 聚价格+列表，消灭服务端自己的 waterfall。浏览器直打 N 个接口，SSR 的 TTFB 会被最慢那个拖死。
- 地图 / 统计 SDK：`dynamic import`，hydrate 后再 `init`。不要在 render 函数里碰 `window`。
- 序列化：state 必须能 `JSON.stringify`。`Date`、函数、`undefined`、循环引用会丢或报错。下发到页面上等于 **内嵌在 HTML 里的字符串**，要防 `</script>` 注入（用安全序列化，不要手拼）。

CSR 则：鉴权可以 localStorage；数据全在 hydrate 之后；没有「两端第一帧必须一致」的约束，但首屏空。

### （4）缓存、个性化、实时价

CSR 壳可以长期 CDN。SSR 的 HTML 若按 URL 缓存：未登录列表可以；**登录态、实时价、AB 实验** 一旦进 HTML，CDN 会把 A 用户的页给 B。

30k 答法：公有页缓存 HTML；个性化块客户端再补，或 `Cache-Control: private`、按 cookie 分桶（成本高）。酒店价常 **HTML 出列表结构 + 价签可降级**，价格再补——和「部分酒店无价」同一类。

SSG / ISR：构建时或定时出 HTML，像 CSR 那样吃 CDN，但没有每次请求的 Node render。文档、运营静态页适合；实时库存不适合整页 SSG。

### （5）流式 SSR（React 18）和「看得见点不了」

`renderToString`：整棵树算完才吐 HTML，最慢的那个数据源卡死 TTFB。

`renderToPipeableStream` / `renderToReadableStream`：壳和已就绪的块先流出去，`Suspense` 的 fallback 占位，数据到了再推后续 HTML。TTFB 更好看。

**选择性 hydrate**：先hydrate 用户点到的那一块，不必等整页 Fiber 建完。大列表页这才是 30k 该知道的「TTI 为什么还能救」。没上过流式就说没上过，原理能讲。

RSC（React Server Components）不是经典 SSR 的别名：服务端组件不进客户端 bundle，客户端组件才 hydrate。Next App Router 在用。携程那次是 **经典 SSR + 客户端 hydrate**，别把 RSC 说成自己做的。

### （6）怎么选（30k 要带代价）

| | 用 |
|--|----|
| SSR | 要被搜到、要分享有图、弱网也要先看见字：列表、商详、活动落地 |
| CSR | 登录后中后台、编辑器、强交互、SEO 无意义；选座这种重 SDK 也可以 CSR + 性能 |
| 混合 | 页壳 SSR，重模块 CSR（地图）；或仅首屏 SSR，后续 `pushState` CSR |

成本：Node CPU/内存随 QPS 涨；错误变成 500 而不是前端白屏；排查要分「这次 render 在哪台机器」。SSR 挂了要有 **降级吐壳走 CSR** 的预案，否则源站一炸全站没 HTML。

猫眼选座：交互和登录后流程为主，CSR + 并行/分包。Trip.com 地图列表：国际化、首屏、SEO，SSR + BFF；地图客户端 init。

---

## 追问（按深挖密度）

**Q：SSR 一定比 CSR 快？**  
A：FCP/LCP 通常更好；TTFB、TTI 不一定。Node 慢或 hydrate 重，用户体感更差。看指标口径。

**Q：为什么看得见却点不了？**  
A：HTML 已经 paint，事件在 hydrate 之后。JS 大、树大，这段空白更长。流式 + 选择性 hydrate 是为这个。

**Q：mismatch 你怎么查？**  
A：对警告里的文案/DOM；查 `Date`/`random`/locale；查是否又打了接口；查非法标签。用下发 state 复现第一帧。

**Q：首屏数据放 useEffect？**  
A：等于 CSR。paint 之后才拉，HTML 是空的，还多一次 hydrate。

**Q：地图为什么 SSR 不了？**  
A：Google Map/Mapbox 要 `window`。列表和价 SSR；地图 dynamic import，hydrate 后 init。

**Q：状态怎么到客户端？**  
A：render 前的数据 serialize 进 HTML，客户端读同一份 hydrate。注意 XSS（`</script>`）。不要两端各算各的。

**Q：Cookie 登录 SSR 读不到？**  
A：Token 只在 localStorage。Node 只能转发请求头里的 Cookie。

**Q：和 SSG？**  
A：SSG 构建时出 HTML，无每请求 render，CDN 友好；数据不能太实时。SSR 每次（或按缓存策略）在请求里 render。

**Q：Next 的 getServerSideProps 是什么？**  
A：就是「这次请求、render 前拉数」。App Router 里很多是 Server Component 里 await。`useEffect` 仍是客户端。

**Q：Vue 呢？**  
A：`onServerPrefetch` / Nuxt `asyncData` / `useAsyncData` 同一位置：render 前。hydrate 概念一样。

**Q：SSR 进程内存涨？**  
A：每请求一棵树、一份数据。超时、并发上限、泄漏的全局缓存会把 Node 打满。和浏览器泄漏不是同一个堆，但「引用没放」一样查。

**Q：降级？**  
A：Node 超时或 5xx → 吐壳 + 客户端拉数（CSR 兜底），或过期 HTML。不要死等 render。
