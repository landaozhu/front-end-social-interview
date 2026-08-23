# CommonJS 与 ES Module 完整对比表
| 对比维度 | CommonJS（Node 默认，require/module.exports） | ES Module（ESM，import/export，.mjs / "type":"module"） |
| ---- | ---- | ---- |
| 文件标识 | 默认 `.js`；package.json 无 `type` 字段 | 后缀 `.mjs` / package.json 配置 `"type":"module"` |
| 导入语法 | `require('./xxx')` 动态导入 | `import xxx from 'xxx'` 静态导入；动态导入 `import()` 返回 Promise |
| 导出语法 | `module.exports = {}` / `exports.xxx = xx` | 1. 命名导出：`export let num; export { num }`<br>2. 默认导出：`export default xxx` |
| 导出本质 | 值拷贝（基础类型存副本，对象存引用） | 实时变量绑定（指向模块原始变量，只读绑定） |
| 执行时机 | 运行时加载（动态，代码执行阶段解析依赖） | 编译时静态解析（代码执行前分析 import/export，不能写在 if/for 内） |
| 循环依赖处理 | 缓存导出快照，拿到加载中途导出的值 | 实时绑定，始终读取模块最新变量 |
| 顶层 this | 顶层 `this = module.exports` | 顶层 `this = undefined`（严格模块模式） |
| JSON 文件导入 | `require('./a.json')` 直接解析 | 必须用 `fs.readFile` + `JSON.parse`，无原生快捷导入 |
| 文件扩展名省略 | 可省略 `.js`/`.json`，自动路径查找 | 导入必须写完整后缀 `./counter.js`，不能省略 |
| 导出重写 | 可直接覆盖 `module.exports = 新对象` | 默认导出不能直接重写变量绑定，仅可修改内部属性 |
| 严格模式 | 非默认，需手动添加 `use strict` | 默认开启严格模式，无需手动声明 |
| 顶层 await | 不支持 | 支持顶层 await，可直接在模块顶层书写 await |

总结：
两者最大的区别是模块加载机制不同。CommonJS 是运行时模块系统，通过 require 和 module.exports 工作，依赖关系可以动态确定；ES Module 是 JavaScript 官方标准模块系统，通过 import/export 工作，静态 import 的依赖关系在模块执行前就可以确定。

这会带来几个重要区别：第一，ESM 更适合 Tree Shaking，因为构建工具可以静态分析依赖；第二，ESM 使用 live binding，而 CommonJS 更接近通过 exports 对象进行导出；第三，两者对循环依赖的处理机制不同；第四，ESM 原生支持浏览器，也是现代前端工程更推荐的模块体系，而 CommonJS 主要历史上广泛用于 Node.js。

另外 ESM 也支持 import() 动态加载，因此可以配合 Code Splitting 实现按需加载。

## 追问
CommonJS / ESM
       ↓
① 为什么 ESM 能 Tree Shaking？
       ↓
② 什么是 live binding？
       ↓
③ CommonJS 循环依赖为什么会出现 undefined？
       ↓
④ ESM 的 import 为什么必须放顶层？
       ↓
⑤ import() 和 import 有什么区别？
       ↓
⑥ Webpack/Vite 是怎么处理 CJS 和 ESM 的？