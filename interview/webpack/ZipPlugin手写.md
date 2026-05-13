# webpack：手写一个 ZipPlugin

在构建产物写出磁盘 **之前**，把所有 `compilation.assets` 打进一个 zip，再作为 **新 asset** 挂回本次编译。截图思路是 `emit` 异步钩子 + `jszip` + `webpack-sources` 的 `RawSource`。

---

## 依赖

```bash
npm i jszip webpack-sources -D
```

---

## 实现（带注释）

```js
const JSZip = require('jszip');
const { RawSource } = require('webpack-sources');

/**
 * 构建结束后，把当前 compilation 里已有产物全部压缩成一个 zip 文件。
 * 截图里常见笔误：写成 context.option.filename —— 应使用构造器里保存的 this.options。
 */
class ZipPlugin {
  /**
   * @param {{ filename?: string }} [options] 生成 zip 的文件名，默认 dist.zip
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Webpack 插件入口：拿到 compiler，在合适的生命周期上注册钩子。
   */
  apply(compiler) {
    /**
     * emit：资源已确定、即将写入输出目录之前（异步钩子用 tapAsync）。
     * 此时可以读 compilation.assets，也可以继续往 assets 里追加新文件。
     */
    compiler.hooks.emit.tapAsync('ZipPlugin', (compilation, callback) => {
      const { assets } = compilation;
      const zip = new JSZip();

      // 遍历本次编译产生的所有资源文件名
      Object.keys(assets).forEach((filename) => {
        const asset = assets[filename];
        /**
         * webpack-sources 封装后的对象：.source() 得到字符串或 Buffer（视资源类型而定）。
         * 旧版可能是 .sourceAndMap()，这里与截图一致用 .source()。
         */
        const source = asset.source();
        zip.file(filename, source);
      });

      const zipFilename = this.options.filename || 'dist.zip';

      zip
        .generateAsync({ type: 'nodebuffer' })
        .then((buffer) => {
          /**
           * RawSource：告诉 webpack「这是一段原始字节/字符串资源」。
           * 写入 assets 后，该文件会参与后续输出（与其它 chunk 一并落盘）。
           */
          compilation.assets[zipFilename] = new RawSource(buffer);
          // 无错误时必须调用 callback()，webpack 才会继续后续流程
          callback();
        })
        .catch((err) => {
          // 出错把错误传给 webpack，构建会失败并打印栈
          callback(err);
        });
    });
  }
}

module.exports = ZipPlugin;
```

---

## 使用示例

```js
const ZipPlugin = require('./ZipPlugin');

module.exports = {
  // ...
  plugins: [
    new ZipPlugin({ filename: 'release.zip' }),
  ],
};
```

---

## 面试可追问

- 为什么在 **`emit`** 而不是更早：`emit` 时 asset 列表已稳定；再早可能还有插件会改 assets。  
- **不要把 zip 自己再打进 zip**：若 zip 文件名与遍历 key 冲突，需过滤当前 `zipFilename`。  
- **大项目**：全量 `generateAsync` 可能耗时与内存压力大，可口述分卷或只打部分目录的优化方向。

## 参考

- [Webpack Compiler Hooks](https://webpack.js.org/api/compiler-hooks/#emit)
- [webpack-sources](https://github.com/webpack/webpack-sources)
- [JSZip](https://stuk.github.io/jszip/)
