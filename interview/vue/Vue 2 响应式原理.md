追问：

Observer、Dep、Watcher 分别负责什么？
getter 为什么要 dep.depend()？
setter 为什么 dep.notify()？
Dep.target 是干什么的？
一个组件为什么可能依赖多个 Dep？
为什么 Vue 2 新增对象属性检测不到？
为什么数组不能简单按照普通对象处理？
Vue.set 到底解决了什么？
数组的 push/pop/splice Vue 2 是怎么监听的？