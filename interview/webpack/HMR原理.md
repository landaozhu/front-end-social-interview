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