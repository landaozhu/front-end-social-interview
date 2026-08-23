响应式系统：

Vue 2：基于Object.defineProperty，无法自动检测对象属性的添加/删除和数组索引变化，需借助Vue.set/Vue.delete等特殊 API。
Vue 3：基于Proxy，原生支持对对象和数组的各种变化监听，无上述限制，性能更优。
API 设计：

Vue 2 (Options API)：按选项（data,methods等）组织代码，逻辑分散。复用代码使用 Mixins，容易引发命名冲突。
Vue 3 (Composition API)：按逻辑功能组织代码，相关代码集中，更利于维护和阅读。复用代码使用自定义 Hook 函数，清晰灵活，且原生 TypeScript 支持极佳。
性能与编译器：

Vue 3 在编译阶段进行了大量优化：
Tree-shaking：未使用的 API 不会打包进最终产物，体积更小。
Patch Flags：编译时标记动态节点，Diff 算法时直接定位变化，大幅提升虚拟 DOM 比对效率。
静态提升：将静态节点缓存，跳过重复渲染。
结果：Vue 3 在打包体积、更新性能、内存占用上均优于 Vue 2。
新特性：

Vue 3 新增了 Teleport（将组件渲染到指定DOM）、Fragment（支持多根节点模板）等特性，解决了常见开发痛点。

---
##  兼容性
vue3放弃了ie11，因为proxy无法被polify或者被babel编译，新的浏览器才有实现
### 追问
#### 为什么 Proxy 无法被 Polyfill？

这是最常见的。

你应该答：

Polyfill 本质是在 JavaScript 层补充缺失 API，例如 Promise、Map 等。

但 Proxy 属于引擎级能力，访问属性时浏览器会主动触发 get、set 等 trap。

如果浏览器本身不支持 Proxy，那么读取 obj.name 时根本不会进入代理逻辑，因此无法通过普通 JavaScript 代码模拟
#### 为什么proxy不能被babel编译
new Proxy(target, handler)

不是语法。

它是：

运行时对象(Runtime API)
#### Proxy 比 defineProperty 好在哪里？