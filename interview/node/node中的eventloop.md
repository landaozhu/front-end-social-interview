Node 中的 Event loop
## 宏任务
Node 的 宏任务 分为6个阶段，它们会按照顺序反复运行
```
┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<──connections───     │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘
```
timer
timers 阶段会执行 setTimeout 和 setInterval

一个 timer 指定的时间并不是准确时间，而是在达到这个时间后尽快执行回调，可能会因为系统正在执行别的事务而延迟。

下限的时间有一个范围：[1, 2147483647] ，如果设定的时间不在这个范围，将被设置为1。

I/O
I/O 阶段会执行除了 close 事件，定时器和 setImmediate 的回调

idle, prepare
idle, prepare 阶段内部实现

poll
poll 阶段很重要，这一阶段中，系统会做两件事情

执行到点的定时器
执行 poll 队列中的事件
并且当 poll 中没有定时器的情况下，会发现以下两件事情

如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者系统限制
如果 poll 队列为空，会有两件事发生
如果有 setImmediate 需要执行，poll 阶段会停止并且进入到 check 阶段执行 setImmediate
如果没有 setImmediate 需要执行，会等待回调被加入到队列中并立即执行回调
如果有别的定时器需要被执行，会回到 timer 阶段执行回调。

check
check 阶段执行 setImmediate

close callbacks
close callbacks 阶段执行 close 事件

并且在 Node 中，有些情况下的定时器执行顺序是随机的

setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
    console.log('setImmediate');
})
// 这里可能会输出 setTimeout，setImmediate
// 可能也会相反的输出，这取决于性能
// 因为可能进入 event loop 用了不到 1 毫秒，这时候会执行 setImmediate
// 否则会执行 setTimeout
当然在这种情况下，执行顺序是相同的

var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    setImmediate(() => {
        console.log('immediate');
    });
});
// 因为 readFile 的回调在 poll 中执行
// 发现有 setImmediate ，所以会立即跳到 check 阶段执行回调
// 再去 timer 阶段执行 setTimeout
// 所以以上输出一定是 setImmediate，setTimeout
上面介绍的都是 macrotask 的执行情况，microtask 会在以上每个阶段完成后立即执行。

## 微任务
### Next Tick Queue（nextTick 队列） 
- 优先级最高
- 唯一入口：process.nextTick(callback)
### Promise Microtask Queue（标准微任务队列） 
 优先级次之

 Promise 相关回调
Promise.then()
Promise.catch()
Promise.finally()
queueMicrotask()
标准通用微任务方法，Node 主流版本均支持。
async / await
语法糖，await 之后的代码，会被编译为 Promise 微任务，进入本队列。

执行规则：每次触发微任务清空，必须先把 nextTick 队列全部执行完，再执行标准微任务队列；且队列内任务按入队顺序执行。


### 版本差异
核心前置总规则（全版本统一，不会变）
整体执行骨架：
全局同步代码 → 清空全局微任务 (nextTick → 标准微任务) → 进入事件循环 6 大宏任务阶段
Node 微任务固定两级优先级：
nextTick 队列 > Promise/queueMicrotask 标准微任务队列

Node ≤ v10：同阶段所有宏任务跑完 → 再跑全部微任务
Node ≥ v11：一个宏任务 → 清微任务 → 下一个宏任务（与浏览器一致）

```javascript
setTimeout(()=>{
    console.log('timer1')

    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)

setTimeout(()=>{
    console.log('timer2')

    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```
// 以上代码在浏览器和 node 中打印情况是不同的
// 浏览器中一定打印 timer1, promise1, timer2, promise2
// node 中可能打印 timer1, timer2, promise1, promise2（v10）
// 也可能打印 timer1, promise1, timer2, promise2（v11）


```javascript
setTimeout(() => {
 console.log("timer1");

 Promise.resolve().then(function() {
   console.log("promise1");
 });
}, 0);

process.nextTick(() => {
 console.log("nextTick");
});
// nextTick, timer1, promise1
```