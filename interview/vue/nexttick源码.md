nextTick 内部维护了一个 callbacks 队列和一个 pending 状态。每次调用 nextTick(cb) 时，会先把回调放进 callbacks。如果当前还没有安排异步刷新，也就是 pending === false，就把 pending 设为 true，然后通过 timerFunc 注册一次异步任务。这个异步任务真正执行时会调用 flushCallbacks，一次性把这一轮收集到的所有回调按顺序执行，并重置 pending，这样下一轮 nextTick 又可以重新注册异步任务。这样做的目的，是把同一轮多次 nextTick 合并成一次异步调度，避免重复创建微任务。
## 追问
1. 为什么不用宏任务
因为Vue会通过nextTick完成异步调用更新队列，最终完成dompach。微任务会在同步代码执行完成之后，绘制之前进行执行。因此可以让dom patch和用户设置的nextTick尽快完成调用。如果使用宏任务，更新会推迟到下一轮任务，浏览器中间可能会绘制旧dom或者中间状态，造成额外渲染，甚至页面卡顿
2. 代码阅读（**不再提问** · 2026-09-02 用户要求永不出）
```javascript
console.log('start')
this.$nextTick(()=>{
  console.log('nextTick1')
  this.$nextTick(()=>{
    console.log('nectTick2')
  })
})
Promise.resolve().then(()=>{
  console.log('promise')
})
console.log('end')
```
start
end
nextTick1
promise
nectTick2