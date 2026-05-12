# UglifyJsPlugin vs TerserPlugin

| 特性 | UglifyJsPlugin | TerserPlugin |
|------|----------------|--------------|
| 支持语法 | ES5 | ES2015+ (ES6+) |
| 兼容性 | 只能压缩 ES5 代码 | 支持 ES6+，可直接压缩现代 JS，无需先转 ES5 |
| Tree Shaking | 对 ES6 module 支持有限 | 原生支持 ES6 module，配合 Webpack Tree Shaking 更高效 |
| 体积优化 | 基本压缩 | 更智能压缩（`collapse_vars`、`reduce_vars`、`dead_code`、`drop_console` 等可配置） |
| 多线程 | 不内置 | 内置 `parallel` 参数，利用多核 CPU 并行压缩 |
| 源地图支持 | 支持，但配置复杂 | 完善支持 Webpack source map，集成方便 |
| 维护与更新 | 维护较慢，社区少 | 现代库，Webpack 官方推荐，持续更新 |
| 集成 Webpack | Webpack 4 以前常用 | Webpack 4.37+ / 5 默认压缩工具 |
