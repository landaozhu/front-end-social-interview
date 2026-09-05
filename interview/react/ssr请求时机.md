# SSR 项目请求时机是什么？数据该在哪一层拉？

【一句话】**首屏关键数据在服务端 render 之前拉完，塞进 HTML；浏览器 hydrate 后再拉的是交互/非首屏数据。** 全放 `useEffect` 就变成 CSR 空壳，SSR 没意义。

## 时机

```
Node 收到请求
  → 鉴权 / 路由
  → 拉首屏数据（BFF 聚合更好）
  → renderToString，数据 serialize 进 HTML
  → 浏览器出第一屏（FCP）
  → hydrate 接事件
  → useEffect：地图 SDK、埋点、分页、与 window 相关的
```

| 放哪 | 什么数据 |
|---|---|
| 服务端、render 前 | 标题、列表、价格、SEO、首屏就要看见的 |
| 客户端 hydrate 后 | `window` / Map、个性化、二次屏 |

## 为什么不能在 useEffect 拉首屏

useEffect 在 paint 之后。SSR HTML 若是空列表，用户先看白/骨架，再等接口，和 CSR 一样慢，还多一次 hydrate。

## 项目怎么答（携程地图）

酒店地图列表：SSR 预取酒店和价格；Google Map 依赖 `window`，**dynamic import，hydrate 后再 init**。Java BFF 把多个接口聚成一次，减少 waterfall。首屏 4s→2s。

## 追问

- **hydration mismatch？** 服务端和客户端第一遍 render 的数据必须一致。用下发的 JSON 注水，不要客户端再算一遍不同结果。
- **Next.js？** `getServerSideProps` / App Router 的 server component 就是「render 前拉」。`useEffect` 仍然是客户端。
- **Vue SSR？** `asyncData` / `onServerPrefetch` 等价位置。
