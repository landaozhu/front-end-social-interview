# less-loader（30k 手写题：Webpack loader + less.render）

截图里的写法抓住了 **`this.async()` + `less.render`** 这条主线：Less 编译是 **异步** 的，必须用 webpack 提供的 `callback(err, content, map?)` 把结果交回去。

截图里常见笔误/口误点：**形参叫 `resource` 却在函数体里写 `source`**——下面统一用 **`source`**（与 webpack loader 约定一致：第一个参数就是模块源码字符串）。

---

## 1. 面试官想听的「三句话」

1. **输入**：`.less` 源码字符串。  
2. **核心**：调用官方 `less.render` 把 Less 编译成 **CSS 字符串**（可选 source map）。  
3. **输出**：`callback(null, css, map)`；出错走 `callback(err)`。

---

## 2. 对齐截图的异步实现（推荐写法：Promise + this.async）

`less` 新版本以 **Promise** 为主；面试写 Promise 链更不容易在回调参数上翻车。

```js
const less = require('less');

/**
 * webpack less-loader（精简版）
 * @this {import('webpack').LoaderContext}
 */
module.exports = function less_loader(source) {
  const callback = this.async();
  const options = typeof this.getOptions === 'function' ? this.getOptions() : {};

  less
    .render(source, {
      filename: this.resourcePath,
      ...options,
    })
    .then((output) => {
      // output.css / output.map
      callback(null, output.css, output.map);
    })
    .catch((err) => {
      callback(err);
    });
};
```

如果你要 **刻意对齐截图「callback 风格」**（部分版本/示例仍会出现），可以口述等价关系：`less.render(..., (err, output) => ...)` 与 Promise **二选一**，不要混用导致重复调用 `callback`。

---

## 3. 为什么一定要 `this.async()`

- `less.render` **不是**同步立刻返回最终 CSS（文件 IO、解析、计算都可能异步化）。  
- 一旦异步，**不能** `return css`（webpack 会认为你同步返回了 `undefined`）。  
- `this.async()` 返回的 `callback` 是 webpack 约定的 **异步出口**。

---

## 4. 加分：纯手写「Less 变量子集」（不是替代 less.render）

当面试官追问「less-loader 除了调 less 还会不会手写预处理」时，可以补一段 **极简变量替换**：只证明你理解「预处理输出仍是 CSS 文本」，**不替代**真实 `less.render`。

```js
function miniLessVariablesToCss(src) {
  const vars = {};
  let code = src.replace(/@([\w-]+)\s*:\s*([^;]+);/g, (_, name, val) => {
    vars[name] = val.trim();
    return '';
  });
  Object.keys(vars).forEach((k) => {
    code = code.replace(new RegExp(`@${k}\\b`, 'g'), vars[k]);
  });
  return code.trim();
}
```

---

## 5. 参考

- [less 官方文档](https://lesscss.org/)
- [less-loader 仓库](https://github.com/webpack-contrib/less-loader)
