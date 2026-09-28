# JSBridge / 桥是怎么通信的？

25k 一面过关线：能说出 **两边不能共享内存，只能序列化传消息**；能走通 **JS → Native → 回调 JS**；追问能接到 **小程序双线程的 `setData` 就是过桥**，以及 **为什么大数据、高频率会卡**。只说「JS 调原生」不够。

uni-app 怎么编译到多端见 [uniapp跨端原理](../对比题/uniapp跨端原理.md)。本题只讲 **桥**。

---

## 开口（40 秒）

桥出现是因为 **两套运行时各管各的内存**。WebView / JSCore 里的 JS 拿不到 Native 对象，Native 也不能直接改页面 DOM。要拍照、登录、改界面，只能把请求编成一份可传输的数据（方法名、参数、回调 id），从一座「桥」送过去，对方做完再用 id 把结果送回来。

Hybrid：JS 调相机，Native 拍完 `evaluateJavascript` 把结果塞回页面。小程序：逻辑层没有 DOM，渲染在另一条线程，`setData` 就是把 JSON 过桥给渲染层去 patch。本质一样：**异步消息 + 序列化**，不是函数直接调用。

---

## 1. 为什么必须有桥

| 一侧 | 另一侧 | 过不去的原因 |
|------|--------|----------------|
| 页面 JS | iOS / Android 原生 | 进程/运行时隔离，无共享堆 |
| 小程序逻辑层 | 渲染层 WebView | 微信故意拆开，JS 碰不到 DOM |
| uni-app App 的 `uni.*` | plus / 原生模块 | 业务 JS 仍在 JS 引擎里 |

对象、闭包、DOM 节点都不能直接扔过去。能过桥的是 **JSON 能表示的东西**。所以回调不能传函数本体，只能传 **callbackId**，对侧调完再按 id 找回来执行。

---

## 2. Hybrid 经典链路（H5 嵌在 App 里）

```
JS 调 Native：
  1. 生成 callbackId，把 success 存进 Map
  2. 发消息 { api: 'login', params, callbackId }
  3. Native 收到 → 真正调系统能力
  4. Native 调 JS：window.__bridge.callback(id, result)
  5. JS 用 id 取出函数执行，再删掉
```

消息怎么送，一面记住两种就够：

1. **注入对象**：Android `addJavascriptInterface`、iOS `WKScriptMessageHandler`，JS 调 `window.Native.login(...)`
2. **拦截约定**：旧方案用 iframe / 自定义 URL scheme / `prompt`，Native 拦请求当 RPC

Native → JS 一律是 **在 WebView 里执行一段 JS 字符串**（`evaluateJavascript`）。

安全：注入对象要限制域名；随便暴露文件系统接口等于 XSS 升级成原生权限。

---

## 3. 小程序：逻辑层和渲染层之间也是桥

微信不让逻辑层碰 DOM（安全 + 性能可控）：

```
逻辑层 JSCore  --setData JSON-->  Native  --patch-->  渲染层 WebView
渲染层 tap    --事件对象------>  Native  --回调---->  逻辑层
```

`this.setData({ list })` 不是赋值，是 **序列化一份数据过桥**。列表很大、一次 set 全量、或滚动里狂 set，都会堵在桥上：序列化耗 CPU，渲染线程还要更新视图。

选座页因此 **按区域更新座位，禁止一次把整张图 set 过去**——这是桥的成本，不是「小程序 API 写错了」。

`setData` 路径可以带字符串（`'list[0].price'`），为的是少传整棵对象。频繁通信仍然贵。

---

## 4. 和 uni-app 的关系（别和原理题混成一道）

| 端 | 桥在哪 |
|----|--------|
| H5 | **没有 Native 桥**。`uni.request` 就是浏览器 `fetch` |
| 微信/支付宝小程序 | 用的是**宿主的桥**，数据更新最终还是 `setData` 那条 |
| App | `uni.xxx` 再对到 plus / 原生模块，才是经典 JSBridge |

所以：跨端原理回答「编译 + `uni` 映射」；问桥就回答「隔离的运行时靠消息通信」。uni-app 没有发明一座新桥，是 **按端复用已有的那座**。

---

## 追问

- **为什么是异步的？** 原生能力（相机、网络、定位）本身异步；就算同步能力，过桥序列化也不该堵死 JS 线程。用 callbackId 而不是把函数传过去。
- **小程序为什么拆双线程？** 逻辑层无 DOM，页面卡死也不容易把宿主搞崩；渲染和脚本隔离。代价就是任何 UI 更新都要过桥。
- **和 `postMessage`？** iframe / Worker 的 `postMessage` 也是同一类：结构化克隆 + 消息。JSBridge 多了对 Native API 的那一跳。
- **RN 的 Bridge？** 旧架构同样是异步序列化；新架构 JSI 想减少拷贝。没写过 RN 就点到「同类问题」，不要装做过。
- **你写过原生插件吗？** 没有。业务侧控制 **过桥数据量和频率**（小程序 `setData`、Hybrid 少传整棵树）。
