# useMemo 和 useCallback 有什么区别？

【一句话】**useMemo 缓存值，useCallback 缓存函数。** `useCallback(fn, deps)` ≈ `useMemo(() => fn, deps)`。

| | `useMemo` | `useCallback` |
|---|---|---|
| 缓存 | 计算结果 | 函数引用 |
| 写法 | `useMemo(() => compute(), deps)` | `useCallback(() => do(), deps)` |
| 目的 | 避免重复算 | 避免子组件 / effect 因函数引用变了而重跑 |

```jsx
const value = useMemo(() => heavy(a, b), [a, b])
const onClick = useCallback(() => save(id), [id])
```

## 什么时候必须用

- 传给 `React.memo` 子组件的 props（对象用 useMemo，函数用 useCallback）
- `useEffect(..., [fn])` 里的 fn，不稳会无限跑
- 昂贵计算（过滤、聚合）

## 追问

- **deps 里是对象，改属性会变吗？** 不会。比较的是引用。`obj.x = 1` 同一引用，callback/memo 都不重算。要变就换新对象，或把 `obj.x` 拆进 deps。
- **每次都包？** 不必。只包「引用变了会连坐」的那几个。
- **和 memo？** 见 `useMemo和React.memo`：memo 挡组件，这两个挡值和函数。
