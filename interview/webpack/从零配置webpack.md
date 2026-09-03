# 不用脚手架，从零配一份 Webpack

## 面试怎么开口

脚手架（Vue CLI / CRA / 部分 Umi 内置）把 Webpack 藏起来，改配置要 eject 或改 webpack-chain，黑盒很难针对项目抠性能。

**自己配的核心动机不是「炫技」，是要对构建链路有完整控制权**：哪些文件走哪些 loader、开发和生产用哪套 plugin、chunk 怎么切、hash 怎么打——这些直接决定 **构建速度、产物体积、长期缓存、首屏**。简历上的「Webpack 打包优化 / 构建提速」就是这件事。

开口不要背一份完整 `webpack.config.js`。按方向讲：**先报主题，再点关键词**。面试官追问哪块，再展开哪块。

---

## 先报这几个方向

| 方向 | 解决什么 | 面试关键词 |
|------|----------|------------|
| 骨架 | 从哪进、打到哪、怎么解析 | `entry` / `output` / `mode` / `resolve` |
| JS | 转译、类型、框架、并行 | `babel-loader` / `ts-loader` / `vue-loader` / `thread-loader` |
| CSS | 样式语言、注入 vs 抽离、前缀 | `css-loader` / `less-loader` / `sass-loader` / `postcss-loader` / `style-loader` / `MiniCssExtractPlugin` |
| 静态资源 | 图、字体 | Webpack 5 **Asset Modules**（替代 `file-loader` / `url-loader`） |
| Plugin | HTML、环境变量、清理、压缩、分析 | `HtmlWebpackPlugin` / `DefinePlugin` / `TerserPlugin` / `CssMinimizerPlugin` |
| 开发体验 | 热更新、source map | `devServer` / HMR / `devtool` |
| 性能（自己配的真正原因） | 构建快、体积小、缓存稳 | `cache` / `splitChunks` / Tree Shaking / `contenthash` |

下面按方向点到为止，不把每个 option 展开。

---

## 1. 骨架：entry / output / mode / resolve

- **`mode`**：`development` / `production`。生产默认开启压缩、Scope Hoisting、`usedExports`；开发默认可读、便于 debug。自己配时用环境变量切两套行为，不要开发和生产同一份死配置。
- **`entry`**：单入口 SPA 一个 `main`；多页 / 微前端子应用再拆多入口。入口决定最初那批 Chunk。
- **`output`**：`path`、`publicPath`、文件名。生产用 `[contenthash]`，内容不变 hash 不变，浏览器才能吃长期缓存。Webpack 5 用 `output.clean: true` 替代 `clean-webpack-plugin`。
- **`resolve`**：`alias`（`@` → `src`）、`extensions`（少写后缀）。别配一长串无用 extension，解析会变慢。

这四项是「能跑起来」的底盘，还谈不上优化。

---

## 2. JS 相关

方向就三件事：**转译、圈定范围、能不能并行**。

- **`babel-loader`**：ES 新语法 → 目标浏览器能跑的代码；配 `@babel/preset-env`。polyfill 用 `useBuiltIns: 'usage'` + `core-js`，按需引入，不要整包打进去。
- **TS**：`babel-loader` + `@babel/preset-typescript`，或 `ts-loader` 开 `transpileOnly: true`。类型检查丢给 IDE / `tsc --noEmit`，不要塞进打包主链路。
- **框架**：Vue 用 `vue-loader`；React JSX 走 Babel preset。微前端子应用同样按框架配，不要幻想一份规则打天下。
- **范围**：`include: src`，`exclude: /node_modules/`。脚手架最容易在这里浪费时间——整棵 `node_modules` 过 Babel。
- **`thread-loader`**：放在 `babel-loader` / `ts-loader` 前面，worker 池里转译。小项目开了可能更慢（线程开销），大项目才划算。配合 `cacheDirectory`。

面试补一句：JS 规则的性能，80% 来自 **少处理文件 + 缓存 + 必要才开多线程**，不是堆 loader。

---

## 3. CSS 相关

方向是：**预处理器 → CSS →（可选 PostCSS）→ 注入页面或抽成文件**。loader **从右到左**执行。

以 Less 为例，开发环境：

```text
less-loader → css-loader → style-loader
```

- **`less-loader` / `sass-loader`**：预处理器编译成 CSS。项目用哪种就配哪种，不必三种都上。
- **`css-loader`**：解析 `@import` / `url()`，让 CSS 里的依赖走进 Webpack 模块图。
- **`postcss-loader`**（常见）：`autoprefixer` 按 browserslist 加前缀；需要时再上 cssnano（生产压缩也可交给 `CssMinimizerPlugin`）。
- **怎么进页面（开发和生产必须分开）**：
  - 开发：`style-loader` 把 CSS 注入 `<style>`，改样式走 HMR，快。
  - 生产：`MiniCssExtractPlugin` 抽成独立 `.css`，JS 不背样式字符串，便于并行加载和长期缓存。

不要生产还用 `style-loader`（首屏多一块运行时注入），也不要开发用抽离插件（每次改 CSS 都写盘，HMR 变慢）。这就是自己配相对脚手架的典型收益。

---

## 4. 静态资源

Webpack 5 用 **Asset Modules**，不必再装 `file-loader` / `url-loader`：

| `type` | 作用 |
|--------|------|
| `asset/resource` | 发出独立文件（原 file-loader） |
| `asset/inline` | Data URL 内联（原 url-loader 无限 inline） |
| `asset` | 按体积自动：小图 inline，大图发文件 |

图、字体走这一套即可。`parser.dataUrlCondition.maxSize` 一般 4~8KB。生产文件名带 `[hash]`，和 JS/CSS 的 contenthash 同一套「内容变才变文件名」思路。

---

## 5. Plugin：整体配置里真正「干活」的那一层

Loader 转换模块，Plugin 插在编译生命周期上。从零配时，plugin 按职责记，不要背清单。

| 职责 | 用什么 | 备注 |
|------|--------|------|
| 生成 HTML 并注入资源 | `HtmlWebpackPlugin` | 多入口就多个实例，或按 entry 循环 |
| 编译期常量 | `DefinePlugin` | `process.env.NODE_ENV`、接口域名等，方便 treeshake 掉开发分支 |
| 清旧产物 | `output.clean` | Webpack 5 内置 |
| 抽 CSS | `MiniCssExtractPlugin` | 仅生产 |
| 压 JS | `TerserPlugin` | Webpack 4.37+ / 5 生产默认；可开 `parallel` |
| 压 CSS | `CssMinimizerPlugin` | 搭配 MiniCssExtract |
| 拷贝静态文件 | `CopyWebpackPlugin` | favicon、不进模块图的 public 资源 |
| 看体积 | `webpack-bundle-analyzer` | 优化时开，日常构建关掉 |
| 移动端调试 | `vconsole-webpack-plugin` | 仅开发 / 测试包 |

原则：**开发只留必要的，压缩、抽 CSS、分析器放到生产。** 脚手架常「开发和生产都挂一堆插件」，自己配就是把这条砍干净。

---

## 6. 开发体验

- **`webpack-dev-server`**：`hot: true`，产物打在内存。SPA 配 `historyApiFallback`。
- **HMR**：改 JS / 样式只换模块，不全量刷新。原理另题，见 [HMR原理](./HMR原理.md)。
- **`devtool`**：开发用 `eval-cheap-module-source-map`（快、能映射到源码）；生产按需 `source-map` 或关，别把完整源码 map 无防护地上 CDN。
- **`cache.type: 'filesystem'`**：Webpack 5 持久化缓存，二次构建明显快。这是自己配里最便宜的提速项之一。

---

## 7. 性能：为什么要自己配（面试收口）

自己配不是为了把 loader 名背全，是为了下面三条能按项目拧：

**构建速度**（详见 [提高打包速度](./提高打包速度.md)）

- loader 用 `include` / `exclude` 圈范围
- Babel / TS 开缓存；Webpack 5 `filesystem` cache
- 大项目 `thread-loader`、Terser `parallel`
- 开发禁用压缩和 MiniCssExtract

**产物体积**（详见 [减少包体积](./减少包体积.md)）

- Tree Shaking（ESM + `usedExports` + Terser 删未使用导出）
- `splitChunks` 抽 vendor；`runtimeChunk: 'single'` 避免业务改动带飞 vendor hash
- 按需 polyfill、按需引 lodash 等
- 生产压缩 JS / CSS

**运行时 / 缓存 / 首屏**

- `[contenthash]` + 稳定的 vendor / runtime 拆分 → 长期缓存
- 动态 `import()` 做路由级拆包 → 减小首屏 JS
- CSS 抽离，首屏样式与脚本并行

跟面试官收一句：**脚手架给的是通用默认值；项目体积、入口形态、要兼容的浏览器不一样，默认值一定不是最优。自己配是为了把「构建时间、包体、缓存命中」当成可配置项，而不是黑盒副作用。**

---

## 一份能讲清楚的骨架（不必默写每一行）

下面这份用来把方向串起来。面试画到这个粒度就够，option 细节被追问再补。

```js
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isProd = process.env.NODE_ENV === 'production'
const cssLoaders = [
  isProd ? MiniCssExtractPlugin.loader : 'style-loader',
  'css-loader',
  'postcss-loader',
]

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
    chunkFilename: isProd ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          'thread-loader',
          { loader: 'babel-loader', options: { cacheDirectory: true } },
        ],
      },
      { test: /\.css$/, use: cssLoaders },
      { test: /\.less$/, use: [...cssLoaders, 'less-loader'] },
      { test: /\.s[ac]ss$/, use: [...cssLoaders, 'sass-loader'] },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    isProd && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
    }),
  ].filter(Boolean),
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: isProd,
  },
  devServer: { hot: true, historyApiFallback: true },
  cache: { type: 'filesystem' },
  devtool: isProd ? false : 'eval-cheap-module-source-map',
}
```

Vue 项目在 JS 规则旁加 `vue-loader`，并配 `VueLoaderPlugin`。细节见 [常用配置](./常用配置.md)。

---

## 被追问时怎么接

1. **和 Vite 比？** 自己配 Webpack 仍适合多入口、老项目、loader 生态重的仓库；新 SPA 可以上 Vite。对比见 [vite对比webpack](../对比题/vite对比webpack.md)。
2. **loader 和 plugin 区别？** loader 是模块转换器（文件进、文件出）；plugin 挂 Compiler / Compilation 钩子，能改整个构建过程。
3. **为什么 CSS loader 要倒着写？** Webpack 对 `use` 数组从右到左执行，必须先预处理器，再 `css-loader`，最后注入或抽离。
4. **Webpack 5 相对 4，配置上少装什么？** Asset Modules 替代 file/url-loader；`output.clean` 替代 clean-webpack-plugin；持久化 `cache` 替代不少 `cache-loader`。

---

## 关联笔记

- [常用配置](./常用配置.md)（loader / plugin 清单）
- [打包构建流程](./打包构建流程.md)
- [提高打包速度](./提高打包速度.md)
- [减少包体积](./减少包体积.md)
- [HMR原理](./HMR原理.md)
- [webpack5新特性](./webpack5新特性.md)
