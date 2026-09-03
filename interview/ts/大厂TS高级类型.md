# 中大厂一面：TS 高级类型（工具类型）

喜马拉雅等中大厂一面几乎必问：**不是背名词，是会从已有类型派生新类型**，并能说清 `keyof` / 映射。25k 够用下面这张表，不必上 infer 套三层。

## 一面必会（按出现频率）

| 类型 | 干什么 | 典型场景 |
|------|--------|----------|
| `Record<K, T>` | 键是 K、值是 T 的对象 | 字典、枚举映射、审批类型码 → 配置 |
| `Partial<T>` | 所有字段变可选 | PATCH、表单草稿 |
| `Required<T>` | 所有字段变必填 | 补全默认值之后 |
| `Pick<T, K>` | 只留某些字段 | 列表项、组件 props |
| `Omit<T, K>` | 去掉某些字段 | 去掉 password、去掉内部 id |
| `Exclude<T, U>` | 联合类型里删掉 U | `'a' \| 'b' \| 'c'` 去掉 `'c'` |
| `Extract<T, U>` | 联合类型里只留 U | 从联合里抽出函数类型 |
| `NonNullable<T>` | 去掉 `null \| undefined` | 收窄 unknown/接口字段 |
| `ReturnType<F>` | 函数返回值类型 | 不用手写接口 |
| `Parameters<F>` | 函数参数元组 | 包装函数时复用入参 |

另外常一起考（你题库里已有）：`any` vs `unknown`、函数重载、`interface` vs `type`。

## 地基：keyof + 映射

```ts
interface User {
  id: number
  name: string
  password: string
}

type Keys = keyof User
// 'id' | 'name' | 'password'
```

映射：`[P in K]: ...` 等于「把每个 key 转成一个字段」。工具类型全是这套积木。

## Record

把一堆 key 都映射成同一种值类型。

```ts
type Role = 'admin' | 'user'
const labels: Record<Role, string> = {
  admin: '管理员',
  user: '普通用户',
}
```

等价直观写法：`{ [key: string]: number }` 是「任意字符串键」；`Record<'a' | 'b', number>` 是 **键被锁死**，少写一个会报错。面试对比这一句就够。

## Partial / Required / Readonly

```ts
type Partial<T> = { [P in keyof T]?: T[P] }

function updateUser(id: number, patch: Partial<User>) {}
updateUser(1, { name: '兰' }) // 不用把 User 全填上
```

`Required` 是把 `?` 去掉（源码里是 `-?`）。`Readonly` 加上 `readonly`。

## Pick / Omit

```ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] }
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

type UserVO = Omit<User, 'password'>
type UserCard = Pick<User, 'id' | 'name'>
```

面试原话：**Omit = Pick + Exclude**。先 `keyof` 拿键，`Exclude` 删掉不要的，再 `Pick` 拼回来。

## Exclude / Extract（操作的是联合，不是对象）

```ts
type Exclude<T, U> = T extends U ? never : T
type T = Exclude<'a' | 'b' | 'c', 'c'> // 'a' | 'b'
```

对象删字段用 `Omit`；联合删成员用 `Exclude`。混了会被追问。

## ReturnType / Parameters（infer）

一面说得出「用 infer 从函数类型里抠」即可，不必手写完整。

```ts
function getUser() {
  return { id: 1, name: '兰' }
}
type U = ReturnType<typeof getUser> // { id: number; name: string }
```

## 怎么选（口试）

- 改一部分字段 → `Partial`
- 只要几个字段 → `Pick`
- 去掉敏感字段 → `Omit`
- 做字典 / 映射表 → `Record`
- 联合类型做差集 → `Exclude`

## 喜马拉雅 / 中大厂追问可能

1. `Partial` 只改第一层，嵌套对象不会深 Partial。
2. `Omit` 掉的键如果不在 T 上，内置 Omit 不报错（设计上偏松）。
3. 这些都是 **编译期**，运行时还是 JS，不会真的删字段。
4. 手写：`type MyPartial<T> = { [P in keyof T]?: T[P] }`

## 参考

- [TS 工具类型一次讲透：Pick、Omit、Partial、Record](https://juejin.cn/post/7675302968470323227)
- [从 Pick、Partial 到 Omit 的底层实现](https://blog.csdn.net/meilindehuzi_a/article/details/163865625)
- [内置工具类型源码拆解 Partial/Pick/Omit/Record](https://tools.yiteai.com/books/typescript/ch07)
- 官方： [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- 官方： [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- 仓库对照：`any` vs `unknown` → `interview/对比题/undown和any.md`；重载 → `interview/ts/方法重载.md`
