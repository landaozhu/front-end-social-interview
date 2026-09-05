# type 和 enum 有什么区别？

【一句话】**type 是纯类型，编译后消失；enum 会生成运行时对象。** 前端更常用联合类型，少用 enum。

```ts
type Status = 'pending' | 'ok' | 'fail'   // 擦除，产物里没有
enum StatusEnum {
  Pending = 'pending',
  Ok = 'ok',
}
// 编译后大概是：
// StatusEnum["Pending"] = "pending" 的双向映射对象
```

| | `type`（联合 / 别名） | `enum` |
|---|---|---|
| 存在时机 | 只在类型检查 | 运行时有对象（除非 `const enum`） |
| 能表示 | 联合、交叉、元组、函数… | 一组具名常量 |
| tree-shaking | 无运行时代码 | 普通 enum 不容易摇掉 |
| 和 interface | type 更广；interface 可合并 | 无关 |

`const enum` 会内联成字面量，没有对象，但 Babel 默认不完整支持，很多项目禁用。

一面选型：**字符串联合 + `as const` 对象**，既有类型又有运行时值，又不引入 enum 的坑。

```ts
const Status = { Pending: 'pending', Ok: 'ok' } as const
type Status = typeof Status[keyof typeof Status]
```

## 追问

- **数字 enum？** 默认可反向映射 `Status[0] === 'Pending'`，和字符串 enum 行为不一致，更坑。
- **和 interface？** interface 描述对象形状；enum 是一组值。不是一类东西。
