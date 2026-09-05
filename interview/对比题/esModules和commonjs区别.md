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

### commonjs怎么实现摇树
首先给出核心结论：CommonJS 原生不支持完整、细粒度的 Tree-Shaking，仅 Webpack、Rollup、Vite 等构建工具能做有限兼容处理，也就是伪摇树，无法彻底清除模块内未使用代码，这也是 CommonJS 打包产物冗余、摇树不干净的根本原因。

Tree-Shaking 的底层依赖编译期静态分析，要求构建阶段不执行代码，就能确定全部导入导出关系，安全删除未引用的死代码。ESM 的 import/export 是静态语法，只能传入字符串字面量、导出声明固定、绑定只读，完全满足静态分析条件；但 CommonJS 是运行时动态模块规范，存在几个不可解决的冲突：第一，require 支持动态变量路径；第二，module.exports 可做条件赋值、运行时重新覆盖；第三，导出对象是可修改普通对象，其他模块运行时能新增、修改导出属性。构建工具无法预判运行逻辑，为了避免打包后代码报错，只能保守保留全部代码，没法精准剔除局部无用函数、变量。

即便构建工具通过插件解析 CommonJS，也只能实现有限优化：仅能删除完全没有被任何地方引入的整个文件，只要模块被引入一次，内部所有导出内容都会被完整打包，无法拆分删减。

日常开发中，CommonJS 摇树不干净主要有四类典型场景：

1. 对象聚合批量导出。所有方法挂载在同一个 module.exports 对象上，哪怕只用到其中一个属性，整个导出对象全部保留，多余方法无法剔除；
2. 动态 require、条件导出。if 判断、模板字符串拼接路径，构建工具无法静态确定最终导出内容，直接完整保留；
3. 模块运行时修改导出对象。CommonJS 是单例缓存，外部代码可动态给导出对象新增方法，工具无法预判运行行为，不敢删减任何属性；
4. ESM 引入 CommonJS 模块。CJS 文件会被整体包装成单一默认导出对象，彻底丧失细粒度摇树能力。除此之外，很多第三方库仅提供 CommonJS 产物，没有 ESM 版本，导入后整库打入包内，体积严重膨胀。

工程层面想要解决该问题，有一套落地优化方案：

1. 业务代码统一使用 ESM 规范，摒弃 require/module.exports，拆分独立导出，避免聚合大对象导出；
2. 引入第三方库时，优先选择带 ESM 产物的包，例如 lodash-es 替代 lodash；
3. 构建配置规避 Babel 将 ESM 转 CommonJS，关闭 babel-loader 中 modules: commonjs 配置；
4. Webpack 开启 mode: production，配置 package.json sideEffects 标记无副作用模块，辅助摇树；
5. 针对仅输出 CJS 的老旧库，使用专用按需引入插件，单独裁剪无用代码，降低包体积。

总结来说，CommonJS 动态运行时的设计先天与 Tree-Shaking 的静态分析逻辑冲突，不存在完美解决方案，最优实践是全链路统一 ESM 模块化规范，才能实现干净彻底的摇树优化。

## 精简 1 分钟口述版（面试快速应答）

CommonJS 原生不支持完整 Tree-Shaking，Tree-Shaking 需要编译期静态分析依赖，而 CommonJS 是运行时动态模块，require 支持动态路径、module.exports 可条件赋值、导出对象运行时可修改，打包工具无法安全删减内部无用代码，只能做有限兼容伪摇树。

摇不干净常见原因有四点：批量对象导出、动态 require / 条件导出、运行时修改导出对象、ESM 引入 CJS 模块整体打包。工程优化方案是业务统一 ESM、优先引入库的 ESM 版本、关闭 Babel 转 CommonJS、配置 sideEffects，老旧 CJS 库搭配按需引入插件裁剪代码。