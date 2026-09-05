# useMemo 和 React.memo 有什么区别？

【一句话】**memo 缓存组件，useMemo 缓存值。** 一个挡子树 render，一个挡昂贵计算。

| | `React.memo` | `useMemo` |
|---|---|---|
| 作用对象 | 函数组件本身 | 组件内部的计算结果 |
| 跳过什么 | 父 render 了，props 浅比较没变 → 子不 render | deps 没变 → 不重算那个值 |
| 返回 | 包过的组件 | 缓存后的值 |
| 典型场景 | 列表 item、纯展示子组件 | 大过滤、复杂派生数据、给 memo 子组件的稳定引用 |

```jsx
const Item = React.memo(function Item({ data }) {
  return <div>{data.name}</div>
})

function List({ list, keyword }) {
  const visible = useMemo(
    () => list.filter((x) => x.name.includes(keyword)),
    [list, keyword],
  )
  return visible.map((item) => <Item key={item.id} data={item} />)
}
```

没 `useMemo` 时每次 List render 都 new 一份 `visible`；没 `memo` 时父一 render，Item 全跟着重跑。

## 追问

- **浅比较？** memo 默认对 props 浅比较；对象/函数每次 new 引用，memo 等于没挡。这时才需要 `useCallback` / `useMemo` 稳住引用。
- **和 PureComponent？** PureComponent 是类组件的 memo。
- **滥用？** 缓存也有成本。先量，再包热路径。
