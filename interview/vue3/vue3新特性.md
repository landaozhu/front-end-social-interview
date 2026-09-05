# Vue 3 新特性（25k 一面）

和「Vue2 vs Vue3 区别」「编译优化」分开答：这题专讲 **API / 开发体验上多了什么**。响应式换 Proxy、PatchFlag 点到即可，别把整道对比题背过来。

## 一面口述（约 60 秒）

入口从 `new Vue` 换成 **`createApp`**，一个 app 一份配置，避免全局 `Vue.use` 污染。组织代码主推 **Composition API**，上单用的是 **`<script setup>`**：变量不用 `return`，TS 更好写。

模板侧三件最常考：

- **多根节点（Fragment）**：组件不必包一层无意义 `div`
- **Teleport**：弹窗/抽屉渲染到 `body`，避开父级 `overflow`；微前开了 Shadow DOM 时还要自己指定挂载点
- **Suspense**：异步组件还没好时用 `fallback`，和 React 那个像，但 Vue 里用得少，提一句即可

另外能点名：**多个 `v-model`**（`v-model:title`）、**`emits` 声明**、生命周期 `destroyed` → **`unmounted`**。放弃 IE，因为 Proxy 不能 polyfill。

---

## 面试官要听的清单

| 特性 | 一句话 | 追问接到哪 |
|------|--------|------------|
| `createApp` | 应用实例隔离，插件、全局组件挂在 app 上 | 为什么不用 `new Vue` |
| Composition API / `<script setup>` | 按功能聚合，复用用 composable，不用 mixin | 和 Options 比逻辑不散 |
| Fragment | 多根节点 | 少一层 DOM |
| Teleport | 传送到页面任意节点 | 弹窗、微前 `getPopupContainer` |
| `v-model:xxx` | 一个组件多个双向绑定 | Vue2 只有一个 `value` + `input` |
| `emits` / `defineEmits` | 声明自定义事件 | 文档和类型 |
| 生命周期改名 | `beforeDestroy` → `beforeUnmount` | 你 beforeDestroy 那题 |
| Tree-shaking | 全局 API 改成具名导出，没用的打不进包 | 体积 |

编译器那套（静态提升、PatchFlag、事件缓存）说「还有编译优化」即可，细节走 `vue3做了什么编译优化`。

---

## Teleport（和上单对得上）

```vue
<Teleport to="body">
  <Modal />
</Teleport>
```

普通 SPA：弹窗脱离 `transform`/`overflow: hidden` 的父级。  
qiankun + `strictStyleIsolation`：Teleport 到 `document.body` 会跑出 Shadow，样式丢失——要挂到**子应用根节点**，和 antd `getPopupContainer` 是同一类问题。

---

## Fragment

Vue 2 模板必须单根。Vue 3 可以：

```vue
<template>
  <header />
  <main />
</template>
```

编译成 Fragment，运行时多个根 vnode。少包一层，flex/grid 布局少踩「多出来的 div」。

---

## `<script setup>` 和 Options 差在哪

```vue
<script setup>
const count = ref(0)
function inc() { count.value++ }
</script>
```

编译后和模板同一作用域，不用 `setup()` 里 `return { count, inc }`。  
`defineProps` / `defineEmits` / `defineExpose` 是编译器宏，运行时没有这些函数本身。

---

## 不要和这几题搅在一起

- **Vue2 和 Vue3 的区别**：Proxy vs defineProperty、Options vs Composition、弃 IE
- **Vue3 编译优化**：PatchFlag、静态提升、事件缓存
- **为什么语法糖更快**：`<script setup>` 编译期绑定，少一层代理

这题开口顺序：`createApp` → Composition/`script setup` → Fragment / Teleport / 多 v-model → 生命周期改名。
