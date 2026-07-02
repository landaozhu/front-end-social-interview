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