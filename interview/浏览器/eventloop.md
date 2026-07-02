
## 事件循环
事件循环又叫消息循环，是浏览器渲染主线程的工作方式。在chorome中，它开启一个不会结束的循环，每次都循环从消息队列中取出第一个任务执行，而其他线程只需要在适合的时候将任务加入到队列末尾即可。
过去把消息队列简单分为宏任务和微任务（微任务比宏任务先执行），这种说法目前已经无法满足复杂的浏览器环境，取而代之是一种更加灵活多变的处理方式。根据whatwg最新文档的解释，每个任务又不同的类型，同类型必须放在一个队列，不同任务可以属于不同的队列。不同的任务队列又不同的优先级，在一次的事件循环中，由浏览器自行绝对取哪一个队列的任务，但浏览器必须有一个微队列，微队列的任务一定具有最高的优先级，必须优先调度执行。

| 层级 | 分类 | 包含 API / 场景 | 任务类型 | 补充说明 |
| --- | --- | --- | --- | --- |
| 1（最高） | 微任务 | Promise.then/catch/finally、queueMicrotask、MutationObserver、await 后续代码 | 微任务 | 同步代码执行完，一次性全部清空，所有宏任务、渲染都在它之后 |
| 2 | 渲染阶段 | requestAnimationFrame (rAF)、样式计算、布局、绘制 | 独立渲染环节（非宏 / 微） | 微任务清空后立即执行，在绝大多数宏任务之前 |
| 3 | 交互 UI 宏任务 | click、scroll、keydown、input 等 DOM 用户事件 | 宏任务 | 渲染结束后，优先级最高的宏任务 |
| 4 | 消息通信宏任务 | MessageChannel、window.postMessage | 宏任务 | 排在交互事件之后、定时器之前 |
| 5 | 定时器宏任务 | setTimeout、setInterval | 宏任务 | 经典定时器，有最小延迟 |
| 6 | 网络 I/O 宏任务 | AJAX (XHR)、fetch、文件读写回调 | 宏任务 | 网络请求完成回调，优先级偏低 |
| 7（最低） | 空闲宏任务 | requestIdleCallback | 宏任务 | 浏览器完全空闲才执行，优先级最低 |

> https://whatwg-cn.github.io/html/multipage/#toc-webappapis
8.1.6事件循环
## 宏任务
script setTimeout setInterval I/O UI Render setImmediate(node) ajax
- MessageChannel
```js
const channel = new MessageChannel();
const massage = {data:'lwp'}
channel.port1.postMessage(massage);
channel.port2.onmessage=function(event){
  console.log(event.data)
}
setTimeout(()=>{
  console.log('set')
})
```
## 微任务
promise.then process.nextTick(node) Object.observer （已废弃；Proxy 对象替代）MutationObserver async await 
- nextTick
```js
setTimeout(()=>{
  console.log('setT')
})
nextTick(()=>{
  console.log('nextTick')
})
//nextTick
// setT
```
- proxy
```js
let person={
  name:'lwp'
}
let p1 = new Proxy(person,{
  set(){
    console.log('set')
  }
})
setTimeout(()=>{
  console.log('setT')
})
p1.name='hw'
//set
//setT
```
- MutationObserver
```html
 <div id="root"></div>
  <script>
    const root = document.getElementById('root');
    setTimeout(() => {
     console.log('setT') 
    });
    let observer = new MutationObserver(()=>{
      console.log('dom change')
    })
    observer.observe(root,{
      childList:true,
   
    })
    const a = document.createElement('a');
    a.innerHTML="hh"
    root.appendChild(a)
   
  </script>
```
## 综合面试题
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("js start");
setTimeout(function () {
  console.log("timeout");
}, 0);
async1();
new Promise(function (resolve) {
  console.log("promise");
  resolve();
}).then(function () {
  console.log("then");
});
console.log("js end");
```
首先执行整段代码当成宏任务，从上往下依次执行
第一步：输出js start
遇到setTimeout，放入到宏任务
执行async1
输出async1 start
await async2，线程到这里阻塞，必须等到async2执行完毕
于是输出async2
async1 end被当成微任务放到队列，因为aysnc的底层是promise["async1 end"]
执行newPromise立即执行函数
于是输出promise
then放到微任务["async1 end","then"]
输出js end
把微任务队列拿出来放到主线程去执行
输出async1 end
输出then
把宏任务队列放到主线程
输出timeout
以下就是完整的执行结果
//js start
//async1 start
//async2
//promise
//js end
//async1 end
//then
//timeout
## 参考
- [什么是事件循环 Event Loop](https://juejin.cn/post/7255511957701148727?searchId=20230903181028CCFBA50ED9D79369F525)
- [setTimeout和setImmediate到底谁先执行，本文让你彻底理解Event Loop](https://juejin.cn/post/6844904100195205133?searchId=202309040148497F7A53B9631C9BAC136E)
- [MessageChannel：JavaScript中实现高效深度复制的秘密武器](https://juejin.cn/post/7231369710024327205?searchId=20230904015328C8E8D9619E6141AFD673)
-[事件循环whatwg](https://whatwg-cn.github.io/html/multipage/webappapis.html#%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF)

优先级	学什么	为什么
⭐⭐⭐⭐⭐	HTML Standard（Event Loop）	浏览器真正的规范:https://html.spec.whatwg.org/multipage/webappapis.html?utm_source=chatgpt.com#event-loops
⭐⭐⭐⭐	Jake Archibald - Tasks, microtasks, queues and schedules	浏览器 Event Loop 最经典文章:https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/?utm_source=chatgpt.com
⭐⭐⭐	JavaScript.info Event Loop	面试够用了:https://javascript.info/event-loop?utm_source=chatgpt.com