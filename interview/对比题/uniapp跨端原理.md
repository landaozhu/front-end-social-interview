# uni-app 跨端原理是怎么做的？

25k 一面过关线：能说出 **编译期出多端产物 + 运行时把 `uni.*` 映射到各端 API**；能解释 **为什么还要 `#ifdef`**；追问能分清 **H5 / 小程序 / App 三条运行时不是同一套**。只说「一套代码多端运行」不够。

配套：兼容处理见 [uniapp小程序和h5兼容](./uniapp小程序和h5兼容.md)；通信机制见 [JSBridge](../js/JSBridge.md)。本题只讲 **uni-app 怎么把 Vue 变成多端**。

---

## 开口（40 秒）

uni-app 不是运行时 magically 一套 API 全通，是 **先按目标平台编译，再套一层运行时适配**。

你写的是 Vue 单文件（`view` / `text`、`uni.xxx`）。打包时选定微信 / 支付宝 / H5 / App，编译器把模板、样式、路由编成**那个平台认得的代码**。`uni.request`、`uni.navigateTo` 在运行时再对到 `wx.request`、`wx.navigateTo` 或 H5 的 `fetch` / history。

各端能力不一样（H5 有 DOM，小程序没有），编不掉的差异用 **`#ifdef` 在编译期剥掉**，不是运行时 if 一遍全端代码。所以是「一套业务逻辑、多份产物」，不是一份产物到处跑。

---

## 1. 要解决什么

每个端自己的 DSL 和 API：微信 WXML + `wx.*`，H5 是 DOM + BOM，App 还要碰原生能力。业务（列表、表单、登录）大半相同。uni-app 用 **Vue 开发体验换多端复用**，中间多一层编译和适配。

简历口径：宏波早期用它做办公小程序，了解这层；猫眼选座是 H5 / 原生小程序分端，没用 uni-app——跨端收益盖不住选座这种重交互成本。

---

## 2. 编译期：一份 `.vue`，多份产物

| 目标端 | 编出来大致是 |
|--------|----------------|
| 微信小程序 | `wxml` + `wxss` + `js` + `pages.json` → `view` 还是 `view`，指令对到 `wx:if` / `wx:for` |
| H5 | 普通 Vue SPA，`view` 编成 `div`，走浏览器 |
| App | **App-vue**：WebView 里跑 Vue；**nvue**：走原生渲染（Weex 那一路），没当过生产主力别展开 |

路由、窗口、tabBar 写在 `pages.json`，编译器按端生成小程序的 `app.json` 或 H5 路由配置。

条件编译发生在**编之前**：

```js
// #ifdef H5
window.location.href = url
// #endif

// #ifdef MP-WEIXIN
uni.navigateTo({ url })
// #endif
```

打微信包时 H5 那段直接删掉，包里不会带着 `window`。这是预处理，不是运行时特性检测。

---

## 3. 运行时：`uni.*` 是适配层

编译解决「标签和文件长什么样」；**调用谁**靠 runtime：

- 小程序：`uni.request` → `wx.request` / `my.request`
- H5：对到 `fetch` / XHR，跳转对到 history 或 location
- App：对到 plus / 原生模块（拍照、状态栏）

官方 API 表里「各端支持不同」就是这层对不齐：有的端没有这个能力，编译器也变不出原生才有的接口。所以原理题和兼容题是一件事的两面——原理是映射，兼容是映射失败时 `#ifdef`。

---

## 4. 小程序这条产物，底下仍是双线程

编到微信之后，跑的还是微信那套：**逻辑层 JSCore（无 DOM）+ 渲染层 WebView**，中间过桥。Vue 的数据变了，最终还是要变成 **`setData` 风格的数据过桥**，不是 H5 里直接改 DOM。

所以 uni-app 没有取消小程序限制：主包体积、页面栈 10 层、`setData` 成本都还在。框架只是帮你少写一份 WXML。

桥本身见 [JSBridge](../js/JSBridge.md)，不要在这题里把桥的实现背完。

---

## 追问

- **和 Taro？** 同一类：编译 + 运行时。Taro 偏 React 团队；uni-app 偏 Vue。不是谁更「原生」。
- **和原生小程序？** uni-app 多一层编译和 API 映射，排查要分「框架问题还是业务问题」；新能力往往等框架跟进。流量集中单端、重交互 → 原生更短。
- **为什么不能 100% 一套代码？** 运行时环境不同（DOM vs 无 DOM、组件/样式/API 子集不同），编译只能对齐能对齐的，剩下必须条件编译。
- **App 的 vue 和 nvue？** vue 仍是 WebView；nvue 原生渲染，CSS 子集更小。生产没用过就说没用过。
- **你改过编译器吗？** 没有。日常是看 API 支持表 + `#ifdef` + 真机。原理停留在「编译出多端产物 + uni 运行时映射」。
