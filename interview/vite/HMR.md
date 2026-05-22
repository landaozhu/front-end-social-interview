2️⃣ HMR（Hot Module Replacement）对比 Webpack
## Webpack HMR：
Webpack 会生成一个 bundle（或 chunk），HMR 通过 WebSocket 发送变化的模块代码，然后用 模块更新逻辑 替换掉原来的模块。
更新一般是基于 整个 bundle 的变动 → 可能会涉及 runtime 注入。
## Vite HMR：
每个模块本身就是 ESM，可以单独热更新。
Vite dev server 只发送 变化模块的原始 ESM，浏览器直接替换导入 → 极快。
不需要打包整个项目 → 响应几乎是瞬时。
区别总结：

特性	|Webpack HMR	|Vite HMR
--|--|--
模块类型	|Bundle/Chunk|	原生 ESM
更新方式	|runtime 替换模块|	浏览器直接导入新模块
速度	|慢于 Vite（尤其大项目）	|快，接近即时反馈
兼容性	|IE 需要 polyfill|	现代浏览器，老浏览器 dev 不支持