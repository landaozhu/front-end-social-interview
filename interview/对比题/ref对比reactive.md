## 别只答「ref 基本类型、reactive 对象」

这是最常见的浅答。两边都能包对象。真正差别在：**返回值形态、取值方式、能不能换根、解构会不会丢响应式。**

| | ref | reactive |
|--|--|--|
| 入参 | 任意值（基本类型 / 对象 / 数组） | 只能是对象（含数组），基本类型会警告 |
| 返回值 | `{ value: x }` 的 Ref 对象 | Proxy |
| 取值 / 赋值 | `count.value`、`count.value = 1` | 直接 `state.n`、`state.n = 1` |
| 换根对象 | 可以 `obj.value = { ... }` | 不行，整段换成新对象就丢 Proxy |
| 解构 | 解构出来的还是 ref，要 `.value` | 普通解构会丢响应式，要用 `toRefs` / `toRef` |
| 模板 | 自动解包，不用 `.value` | 直接用属性 |

对象走 `ref` 时，内部会再走一遍 `reactive`，所以深层改属性两边都能侦到。

## 原理（一面够用）

Vue3 响应式底层是 **Proxy**，不是 Vue2 的 `defineProperty`。

- `reactive(obj)`：用 Proxy 拦 get/set，做依赖收集和触发更新。
- `ref(x)`：外面先包一层带 `value` 的对象。`x` 是对象时，`value` 再交给 `reactive`；`x` 是基本类型时，靠 `value` 的 get/set 收集依赖。

所以问「底层有什么不同」：不是两套响应式系统，而是 **ref 多了一层 `.value` 盒子；盒子里如果是对象，还是 reactive。**

## 怎么选

- 计数、开关、字符串、要整体替换的数据：`ref`
- 表单、一组有关联的字段（`name` / `age` / `loading`）：`reactive` 也可以
- Composition 里图省事、类型更好推：可以全用 `ref`，风格统一，少踩解构坑

上单 / Vue3 项目里常见写法是 `ref([])`、`ref(true)`，对象表单用 `reactive` 或 `ref({})` 都行，别混用到解构时忘了 `toRefs`。

## 追问

**reactive 包对象，ref 也能包对象，那还要 reactive 干什么？**

要。一组字段用 reactive 不用每个都 `.value`。但解构、换根这两件事必须说清楚。很多团队最终更倾向全 ref。

**为什么解构 reactive 会丢响应式？**

Proxy 拦的是「读这个对象的属性」。`const { name } = state` 拿到的是当下的值拷贝，跟 Proxy 断开了。`toRefs` 把每个 key 变成 ref，读 `name.value` 时再回到原对象上。

**模板里为什么不用写 .value？**

编译时会解包 ref。`setup` / 函数里不会，忘了 `.value` 是最常见 bug。

**shallowRef / shallowReactive 呢？**

只对根一层做响应式，嵌套对象改了不触发。大列表、不想深层代理时才用，默认别开。
