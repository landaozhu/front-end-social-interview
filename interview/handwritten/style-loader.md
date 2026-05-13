# style-loader（30k 手写题：返回「可执行 JS 字符串」）

截图里的核心直觉是对的：**`style-loader` 往往不是在 Node 里操作 DOM**，而是 **返回一段 JS 源码字符串**；这段字符串被打进 bundle 后，在浏览器里执行，再去 `document.createElement('style')` 插入样式。



---

## 1. 面试官想听的「三句话」

1. **输入**：通常是 **`css-loader` 处理后的 JS 模块**再执行得到的 **CSS 字符串**（手写题也常直接假设输入就是 CSS 字符串）。  
2. **输出**：一段 **可执行 JS**（字符串或 AST），执行后把 CSS 塞进 `<head>`。  
3. **追问**：真实 `style-loader` 还有 **pitch**、**singleton**、**HMR**、插入点（`insert`）等工程化细节。

---

## 2. 对齐截图：同步 loader 返回「运行时代码字符串」

```js
/**
 * webpack style-loader（极简同步版：返回一段会在浏览器执行的代码）
 * 注意：真实链路里 source 往往是「css-loader 产物的可执行结果」；
 * 这里为了对齐手写题，假设 source 已经是纯 CSS 文本。
 *
 * @this {import('webpack').LoaderContext}
 * @param {string} source
 */
module.exports = function style_loader(source) {
  const cssExpr = JSON.stringify(source); // 修正截图里的 stringfy 笔误

  return [
    'var el = document.createElement("style");',
    'el.type = "text/css";',
    // innerHTML vs textContent：纯 CSS 文本更推荐 textContent（避免 HTML 解析差异）
    'el.textContent = ' + cssExpr + ';',
    'document.head.appendChild(el);',
    '',
  ].join('\n');
};
```

**为什么不用模板字符串拼外层？**  
因为 CSS 里可能出现 `` ` ``、`$`、`</style>` 等字符；**先用 `JSON.stringify(source)` 得到安全 JS 字面量**，再拼进返回代码，最不容易面试写炸。

---

## 3. 更像真实仓库的一步：把「插入逻辑」做成 IIFE（避免污染全局）

```js
module.exports = function style_loader_iife(source) {
  const cssExpr = JSON.stringify(source);
  return (
    ';(function(){\n' +
    '  var el = document.createElement("style");\n' +
    '  el.type = "text/css";\n' +
    '  el.textContent = ' +
    cssExpr +
    ';\n' +
    '  document.head.appendChild(el);\n' +
    '})();\n'
  );
};
```

---

## 4. 加分追问清单（30k 常问）

- **为什么需要 `css-loader` 在前**：`import './a.css'` 默认拿到的不是「纯字符串」，需要 `css-loader` 把 CSS 变成 **JS 模块**，`style-loader` 再生成 **副作用代码**去插 DOM。  
- **HMR**：更新时应复用同一个 `<style>` 节点或按 module id 管理，避免 head 无限增长。  
- **SSR**：浏览器 DOM API 不存在，需要 `style-loader` 的可注入策略 / 换 `mini-css-extract` 方案。  
- **CSP**：`innerHTML` 可能触发策略限制；工程上常见是外链 CSS 或 nonce/hash 方案（口述即可）。

---

## 5. 参考

- [style-loader 仓库](https://github.com/webpack-contrib/style-loader)
