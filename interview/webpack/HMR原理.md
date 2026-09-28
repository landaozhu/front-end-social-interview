![图片描述](./截屏2026-08-22%2015.46.51.png)
# 一、HMR 核心原理
模块依赖图驱动
Webpack 将每个模块抽象成节点，import/export 或 require 关系形成 ModuleGraph
HMR 根据依赖图判断哪些模块可以安全热替换
模块缓存
__webpack_module_cache__ 存储已执行的模块
HMR 替换模块时，只更新缓存中指定模块 → 避免重建整个 bundle
热更新 Runtime
Webpack 在 bundle 注入 HMR runtime
Runtime 提供：
WebSocket 客户端（或 EventSource）
模块热替换逻辑：hot-check、hot-apply
调用模块的 module.hot.accept() 回调
# 二、自动触发浏览器更新的流程
Dev Server 监听文件变化
文件改动 → Webpack rebuild 改动模块
生成 update manifest（模块 ID、hash 等）
WebSocket 推送变更到浏览器
浏览器端 HMR runtime 建立 WebSocket 连接 → Dev Server 发送更新消息
消息包含：
更新模块 ID
新的 hash
变更模块代码
浏览器 Runtime 处理更新
HMR runtime 根据模块 ID 替换 __webpack_module_cache__[moduleId]
如果模块有 module.hot.accept() → 执行回调
页面状态（表单输入、滚动、组件状态）保持不变
未接受的模块或不可替换模块
HMR 会沿依赖图向上冒泡
如果找不到可替换模块 → 自动刷新页面
关键：浏览器刷新是 HMR runtime 自动触发的，不需要手动操作
# 三、技术细节
模块 ID 和依赖图
模块唯一 ID → 精确定位更新模块
ModuleGraph 记录模块依赖 → HMR 只替换受影响模块
HMR Runtime 逻辑
热检查（hot-check） → 检测哪些模块更新
热应用（hot-apply） → 替换缓存模块 + 执行 accept 回调
CSS / 图片 HMR
CSS → style-loader 自动支持 HMR
图片 → 默认刷新浏览器
# 四、配置关键点
module.exports = {
  mode: 'development',
  devServer: {
    hot: true,        // 启用 HMR
    liveReload: false // 避免整页刷新
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'] // CSS HMR 内置支持
      },
    ],
  },
};
JS 模块：需 module.hot.accept() 才能热替换
DevServer + WebSocket → 自动通知浏览器替换模块
# 五、面试讲法模板

“Webpack HMR 的核心机制：

Dev Server 监听源码变化 → rebuild 改动模块
WebSocket 将更新模块 ID 和新代码推送到浏览器
HMR runtime 替换模块缓存，并调用模块 accept 回调
页面状态保持不变，如果模块不可替换 → HMR runtime 自动刷新页面
这个过程完全自动触发，不需要手动刷新，浏览器收到消息后 Runtime 负责模块替换。”

追问 1： 浏览器接到 WebSocket 之后，hot-check / hot-apply 各做什么？module.hot.accept 的回调是在替换前还是替换后执行？

开口：WebSocket **几乎只带新 hash**，不塞整份模块代码。runtime 先 `check` 把补丁拉下来，再 `apply` 真正换缓存。`accept` 回调在 **替换之后**；要在换掉之前收摊，用 `dispose`。

```text
WS 推 hash
  → hot.check()     下载 *.hot-update.json（谁变了）+ *.hot-update.js（新代码）
  → 还没动 __webpack_module_cache__
  → hot.apply()     沿依赖图找 accept → dispose 旧模块 → 换缓存并执行新 factory → 再跑 accept 回调
  → 冒泡到入口还没人 accept → location.reload()
```

| | 干什么 | 动不动缓存 |
|--|--------|------------|
| **hot-check** | 按 hash 拉 manifest 和补丁，算 outdated 模块名单 | 否，只下载 |
| **hot-apply** | 按名单替换、跑钩子；失败才整页刷新 | 是 |

`module.hot.accept('./dep', cb)`：新模块已经进缓存、factory 跑过了，才调 `cb`。所以回调里再 `require('./dep')` 拿到的是新导出。

`module.hot.dispose(fn)`：在旧模块被踢出缓存 **之前** 调，用来卸监听、把 state 交给 `data`，新模块用 `module.hot.data` 接回来。别把 dispose 说成 accept。

自接受 `module.hot.accept()` 没有这份 `cb`：模块自己被换掉并重新执行。传函数时那是 **error handler**，不是「替换后回调」。

一面别说「WS 把新代码推过来就替换」。推的是通知，拉补丁是 check，换模块是 apply。
