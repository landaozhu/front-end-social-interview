## 回答要点
相同：函数签名
不同：
1.useLayoutEffect的副作用函数在浏览器执行绘制之前触发，useEffect在浏览器执行绘制后触发，因此如果在effect里执行dom更新，useEffect会出现闪一下，而useLayoutEffect不会
2.如果useLayoutEffect的副作用函数里面包含大量的计算，则页面会卡死
2.90%的使用场景用useEffect，剩下的需要读取dom布局并触发同步渲染用useLayoutEffect
3.SSR场景useLayoutEffect会告警

## 追问补充
1.函数签名：参数、返回值
2.useEffect 90%场景是：接口请求、定时器、事件监听、日志等不操作页面布局的逻辑
3.执行dom更新是什么：包含通过setState和修改原生dom api
## 知识点补充
执行过程
