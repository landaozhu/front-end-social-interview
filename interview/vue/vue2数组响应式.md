# Vue2 的数组在 Object.defineProperty 之外怎么做响应式？

【一句话】**不劫持下标，改 7 个变异方法。** `push/pop/shift/unshift/splice/sort/reverse` 被包一层：先走原生，再 `observe` 新元素，再 `ob.dep.notify()`。

## 为什么不 defineProperty 下标

- 数组可能很长，给每个 index 装 getter/setter 太贵  
- `arr[0] = x`、`arr.length = 0` 本来也拦不住（defineProperty 对已有 key 才有效，length 特例）

所以 Vue2 对数组：

1. 不 walk 下标  
2. 把实例的 `__proto__` 指到改过的 `arrayMethods`（7 个方法）  
3. 数组自己还有一个 `ob.dep`，谁在 render 里读过这个数组，谁就订阅它  

```js
// 伪代码
push(...args) {
  const result = originalPush.apply(this, args)
  ob.observeArray(args)   // 新加的对象继续变响应式
  ob.dep.notify()         // 通知渲染 Watcher
  return result
}
```

## 拦不住的

- `arr[i] = x`  
- `arr.length = 0`  
- 非变异方法：`concat` / `map` / `filter` 返回新数组，不会 notify 原数组（要用新数组重新赋值）

补救：`Vue.set(arr, i, x)` / `this.$set`，或 `splice`。

Vue3 用 Proxy，下标和 length 都能拦，这套 arrayMethods 就没了。

## 追问

- **7 个是哪些？** push pop shift unshift splice sort reverse。  
- **读取 `arr[0]` 怎么收集依赖？** 不走下标 getter；render 里读 `arr` 本身（如 `v-for`）会触发 Observer 上的 dep。  
- **对象呢？** 对象才是每个 key `defineReactive`，和数组这套是两条路。
