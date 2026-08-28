# 被面试官嫌弃基础不扎实，那你这些js知识一定要补补

> 来源: https://juejin.cn/post/7274922643453952039

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
## 深浅拷贝



```
const arr1 = [1,2]
const arr2 = arr1;
arr2[1] = 3;
arr1//[1,3]
arr2//[1,3]
```


对引用类型进行赋值，发现一旦一方改变，另一方也会改变，之所以会产生这个问题，就是因为等号赋值只能赋值引用类型的地址。于是出现浅拷贝，那如何实现，方法就太多了，至少要记住三个


数组



```
arr2 = [...arr1]
arr2 = arr1.concat()
arr2 = arr1.slice()
arr2 = Object.assign([],arr1)
arr2 = Array.from(arr1)
arr2 = arr1.map(item=>item)
```


对象



```
obj2 = {...obj1}
obj2 = Object.assign({},obj1)
```


for in



```
obj2 = cloneShalow(obj1)
function cloneShalow(obj){
    const res=Array.isArray(obj)?[]:{}
    for(let key in obj){
        if(obj.hasOwnProperty(key)){
            res[key]=obj[key]
        }
    }
    return res
}
```


但是如果item是引用类型，那么浅拷贝就解决不了了，这时候就得用深拷贝


方法一：JSON.parse(JSON.stringify(obj))
`const b=JSON.parse(JSON.stringify(a))`
缺陷：
会忽略 undefined
会忽略 symbol
不能序列化函数
不能解决循环引用的对象
方法二：MessageChannel



```
function structralClone(obj) {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = (ev) => resolve(ev.data);
    port1.postMessage(obj);
  });
}
var a = { b: new RegExp(/[1-9]/) };
// a.self = a;
(async () => {
  const b = await structralClone(a);
  console.log(b);
})();
```


缺点：




- 对性能有影响

- 拷贝的对象有函数会报错

- 日期会变成字符串
优点：

- 能解决循环引用
方法三：lodash 的深拷贝函数(性能最好，但处理不了 WeakMap 和 WeakSet，由于库的设定，拷贝的对象嵌套不能超过四层)
方法四：自定义深拷贝函数（常考手写）




```
function cloneDeep(source, map = new WeakMap()) {
  if (map.get(source)) {
    return map.get(source);
  }
  //基础数据类型
  if (typeof source !== "object" || source == null) {
    return source;
  }
  //特殊对象
  const types = [Date, Map, Set, RegExp];
  if (types.includes(source.constructor)) return new source.constructor(source);

  const res = new source.constructor();
  map.set(source, res);

  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      res[key] = cloneDeep(source[key], map);
    }
  }

  //处理symbol作为对象属性的情况
  const symbolKeys = Object.getOwnPropertySymbols(source);
  for (const symKey of symbolKeys) {
    res[Symbol(symKey.description)] = cloneDeep(source[symKey]);
  }
  return res;
}
```


具体过程可以看我另一片文章手写深拷贝，你写全了吗
方法五 structuredClone




- 浏览器兼容性问题

- function、WeakMap、WeakSet、Symbol 会报错




## 原型



```
function Person(){}
const p = new Person();
```


隐示原型 `__proto__`
显示原型`prototype`


每个函数都有一个显示原型 `Person.prototype`
每个实例都有一个隐性原型 `p.__proto__`


每个实例的隐示原型指向创造改对象的构造函数的原型



```
p.__proto__===Person.prototype
```


类的原型的构造函数指向自己



```
Person.prototype.constructor=Person
p.__proto__.constructor=Person
```


构造函数的prototype指向显示原型



```
Person.prototype=(Person.prototype)
```



## 原型链






### 理解原型链图的各个难点




- Function.prototype 和 Object.prototype 是两个特殊的对象，他们由引擎来创建

- 除了以上两个特殊对象，其他对象都是通过构造器 new 出来的

- 对象是通过函数创造的，任何引用类型都是对象，包括函数

- 所有原型对象都是Object的实例，除了Object自己的原型对象，因为Object的原型对象的__proto__为null

- 任何构造函数都是Function创造的

- Function.prototype.proto === Object.prototype是为了兼容之前的代码




## instanceOf


判断是否在原型链上
var person = new Person();
person instanceOf Person//true
[] instanceOf Array//true



### 手写instanceOf



```
function instanceOf(left,right){
  const proto = left.__proto__;
  const prototype = right.prototype;
  while(true){
    if(proto===prototype){
      return true;
    }
    if(proto==null){
      return false;
    }
    proto=proto.__proto__;
  }
}
```



## new


new 的执行过程




- 创建一个新对象

- 把新对象的隐示原型和构造函数的显示原型做链接

- 执行构造函数的代码，给新对象添加属性和方法

- 返回新对象




```
```js
function createObj(Father, ...arg){
  const son = {};
  son.__proto__ = Father.prototype
  const result = Father.apply(son, arg)//Father是构造函数
  return (result && typeof result === 'object')? result : son;
}
```



## 作用域


定义：根据名称来查找变量的一套规则，可以把作用域通俗理解为一个封闭的空间，这个空间是封闭的，不会对外部产生影响，外部空间不能访问内部空间，但是内部空间可以访问将其包裹在内的外部空间。
作用：隔离变量
作用域有哪些


词法作用域是编译时就已经确定，而动态作用域是调用才能确定。



```
let a  = '111'
function sayA(){
    console.log(a);
}
function say(){
    let a = '222'
    sayA()
}
say()  //输出111
```


由于sayA在全局里面，当a在sayA找不到时，就在全局找，词法作用域得看当时定义所处的位置，而不是谁调用。this（动态作用域）才会看调用方。



```
let a  = '111'
function say(){
    let a = '222'
    sayA()
    function sayA(){
      console.log(a);
    }
}
say()  //输出222
```


由于sayA在say里面，当a在sayA找不到时，就在say找


自由变量：一个变量在当前没有定义，但被使用了。于是就会一层一层往上找，如果在全局也没有，就会报错。上面的a就是自由变量。


全局作用域：全局作用域是直接写在script标签中的JS代码，或者单独的JS文件中的作用域。浏览器全局作用域是window，node全局作用域是global.globalThis=window||global。
函数级作用域:每个函数内部都是一个作用域，内部函数可以访问外部函数的变量，外部函数则不能访问内部函数的变量。
块级作用域：es6出现let、const才有的块级作用域，在let所在的{}里，会形成暂存性死区，必须得先定义后使用，且变量不能重复定义



```
{
  console.log(a)//报错
  let a;
}
```


作用域链：作用域的集合



```
var a=1;//全局作用域
function fn(){//函数级作用域
  b=2;
  {
    let c=3;
      console.log(a,b,c)//块级作用域:1 2 3
  }
  var b;
}
fn();
```


动态作用域：this



## this


执行上下文



### this 指向




- 简单调用时，this 指向全局

- 严格模式时，this 指向 undefined

- 对象调用方法时，方法的 this 指向调用的对象

- 使用 call、apply、bind 时，this 指向指定的对象

- 使用 new 关键字时，this 指向创建的对象

- 必包，this 指向全局

- new>call|apply|bind>调用




### 如何改变 this 指向


手写call、apply、bind
call



```
function call(context,...args){
    const _context = context || globalThis;
    const fn = Symbol('fn')
    Object.definePropty(_context,fn,{
        enumrable: false,
        value: this,
    )
    delete _context.fn;
    const res = _context.fn(...args);
    return res;
}
```


apply



```
function apply(context,args){
    const _context = context || globalThis;
    const fn = Symbol('fn')
    Object.definePropty(_context,fn,{
        enumrable: false,
        value: this,
    )
    delete _context.fn;
    const res = _context.fn(...args);
    return res;
}
```


bind



```
function bind(context,...args){
    const _context = context == null ? globalThis : Object(context);
    const fn = Symbol('fn')
    const that = this;
    return function F(...innerArgs){
        return that.apply(this instanceof F ? that : _context,[...args,...innerArgs])
    }
    
}
```



## 箭头函数



### 箭头函数特点




- 函数体内this是定义时所在的对象




```
const fn = ()=>{//定义在全局
  console.log(this)//非严格模式指向全局，严格模式指向undefined
}
fn();
function fn1(){
  setTimeout(()=>{//定义在fn1
    console.log(this.a)//1
  })
}
fn1.call({a:1})//fn1.a=1
class Person{
  constructor(){
    this.name='lwp'
  }
  getName=()=>{//定义在构造函数里
    console.log(this.name)
  }
}
const p = new Person();
const {getName} = p
getName()//lwp

//class Person相当于
function Person(){
  this.name='lwp'
  this.getName=()=>{//定义在构造函数里
    console.log(this.name)
  }
}
```




- 必须先定义后使用

- 没有arguments、caller、callee

- 无法用call、apply、bind改变this

- 没有原型属性

- 不能作为generator函数，不能使用yield关键字




```
const fn=()=>{
  return {
    name:'lwp'
  }
}
console.log(fn())
```



### 不适合用箭头函数的场景


1.对象方法



```
const obj={
  name:'lwp',
  getName:()=>{
    console.log(this.name)
  }
}
```


2.作为原型



```
function Person(){
  this.name='lwp'
}
Person.prototype.getName=()=>{
  console.log(this.name)
}
```


3.作为构造函数



```
const Person = () =>{
  this.name = 'lwp'
}
const p = new Person();
```


4.动态上下文中的回调函数



```
const btn = document.getElementById('btn');
btn.addEventListener('click',()=>{
  this.innerHTML='clicked'//原本想改变btn文本
})
```




- Vue生命周期和method（本质methods等函数挂在一个对象里）




```
{
  data(){return {name:'lwp'}},
  methods:{
    getName:()=>{
      return this.name
    }
  },
  mounted:()=>{
    console.log(this.name)
  }
}
```



## 必包


闭包是指有权访问另一个函数作用域中的变量的函数，通常是在嵌套函数中实现。



```
function fn1() {
  var a = 1;
  return function fn2() {
    console.log(a++);
  };
}
var fn = fn1();
fn(); //1
fn(); //2
```



### 必包的设计解决了什么问题


动态作用域难以模块化的问题



### 必包优缺点


优点


- 保护私有变量，避免全局污染

- 延长变量生命周期

- 实现模块化

- 保持状态



缺点


- 内存占用

- 性能损耗：涉及到作用域链查找过程




### 必包怎么回收


如果必包引用的函数是全局变量，那么必包会一直存在到页面关闭，如果这个必包以后不在使用的话，就会造成内存泄露
如果这个必包引用的是局部变量，等函数销毁后，在下次 JavaScript 引擎执行垃圾回收时，判断必包这块内容如果不再被使用了，那么 Javascript 引擎垃圾回收器就会回收这块内存



### 解决必包的内存泄漏问题



```
function fn1(){
    var a;
    return fn2(){
        console.log(a++);
    }
}
var fn = fn1();
fn();
//销毁fn
fn=null;
```



### 应用场景




- for 循环

- 封装私有变量和函数

- 模块化实现

- 实现高阶函数

- 实现回调函数

- 模拟块级作用域

- React Hook



for 循环

```
for (var i = 0; i < 9; i++) {
  (function (i) {
    console.log(i);
  })(i);
}
```


封装私有变量和函数

```
function createPerson() {
  var _name;
  return {
    getName: function () {
      return _name;
    },
    setName: function (name) {
      _name = name;
    },
  };
}
var lwp = createPerson();
lwp.setName("兰为鹏");
console.log(lwp.getName()); //兰为鹏
```


模块化实现

```
(function () {
  function add(a, b) {
    return a + b;
  }
  function sub(a, b) {
    return a - b;
  }
  globalThis.countFn = {
    add: add,
    sub: sub,
  };
})();
var sum = countFn.add(1, 2);
console.log(sum);
```


实现高阶函数

```
function addBy(a) {
  return function (b) {
    return a + b;
  };
}
var addTwo = addBy(2);
console.log(addTwo(5));
```


实现回调函数

```
function getNameAync(cb) {
  setTimeout(() => {
    cb && cb("lwp");
  }, 2000);
}
getNameAync((name) => {
  console.log(name);
});
```


React Hook




## 事件循环


事件循环又叫消息循环，是浏览器渲染主线程的工作方式。在chorome中，它开启一个不会结束的循环，每次都循环从消息队列中取出第一个任务执行，而其他线程只需要在适合的时候将任务加入到队列末尾即可。
过去把消息队列简单分为宏任务和微任务（微任务比宏任务先执行），这种说法目前已经无法满足复杂的浏览器环境，取而代之是一种更加灵活多变的处理方式。根据whatwg最新文档的解释，每个任务又不同的类型，同类型必须放在一个队列，不同任务可以属于不同的队列。不同的任务队列又不同的优先级，在一次的事件循环中，由浏览器自行绝对取哪一个队列的任务，但浏览器必须有一个微队列，微队列的任务一定具有最高的优先级，必须优先调度执行。



whatwg-cn.github.io/html/multip…
8.1.6事件循环




### 宏任务


script setTimeout setInterval I/O UI Render setImmediate(node)




- MessageChannel




```
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



### 微任务


promise.then process.nextTick(node) Object.observer （已废弃；Proxy 对象替代）MutationObserver async await




- nextTick




```
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




```
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




```
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



### 综合面试题



```
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




- 首先执行整段代码当成宏任务，从上往下依次执行

- 第一步：输出js start

- 遇到setTimeout，放入到宏任务

- 执行async1

- 输出async1 start

- await async2，线程到这里阻塞，必须等到async2执行完毕

- 于是输出async2

- async1 end被当成微任务放到队列，因为aysnc的底层是promise["async1 end"]

- 执行newPromise立即执行函数

- 于是输出promise

- then放到微任务["async1 end","then"]

- 输出js end

- 把微任务队列拿出来放到主线程去执行

- 输出async1 end

- 输出then

- 把宏任务队列放到主线程

- 输出timeout

- 以下就是完整的执行结果




```
//js start
//async1 start
//async2
//promise
//js end
//async1 end
//then
//timeout
```



## 模块化



### ES-Module



```
// a.js
export function a (){}
export default A={}
// b.js
import { a } from './a'
import A from './a'
```



CJS和AMD都是运行时确定



优点：容易静态分析
缺点：原生浏览器还没实现该标准



### CommonJs


NodeJs独有实现



```
//a.js
module.exports={
  a:1
}
exports.b=1
//b.js
const A = require('a')
const {b} = requrie('a')
A.a
```


缺点




- 同步的加载方式不适合在浏览器环境中

- 不能并行加载多个模块
AMD
RequireJs提出




```
define(['getSum'],function(math){
  return function(a,b){
    return a+b
  }
})
```



```
require(['getSum'],function(getSum){
  getSum(2,3)
})
```


优点：




- 适合在浏览器环境中异步加载模块

- 可以并行加载多个模块
缺点：

- 提高了开发成本

- 不符合通用的模块化思维方式
UMD
兼容AMD和CJS：如果支持node，就使用CJS，再判断是否支持AMD，支持就使用AMD




```
(function(window, factory){
  if(typeof exports ==="object"){
    //CJS
    module.exports=factory();
  } else if(typeof define==='function'&&define.amd){
    //AMD
    define(factory)
  }else{
    window.eventUtils=factory();
  }
})(this,function(){
  //...
})
```



### CMD



```
define(factory)
```



```
seajs.use([module],callback)
```


缺点：依赖SPM打包，模块的加载逻辑偏重



## Object和Map的区别



### 共同点


减值对的动态集合，支持增删改查键值对



```
var obj={};
obj.a=1;
obj.a=2;
console.log(obj.a)
delete obj.a
```



```
const map = new Map();
map.set('a', 1);
map.set('a',2);
map.has('a');
map.delete('a');
```



### 不同点


创建方法
Object



```
var obj={}
var obj1= new Object();
var obj1 = Object.create();
```


Map



```
const map = new Map([['a',1],['b',2]]);
```


键的类型


- `Object`的键必须是`string`或者`Symbol`

- `Map`的键可以任何类型



键的顺序


- Object


- key是无序

- 对于大于等于0的整数，会按照大小进行排序，对于小数和负数会当作字符串处理

- 对于string类型会按照定义的属性输出

- 对于Symbol会过滤，得用Object.getOwnPropertySymbols才能得到

- Map


- 有序，按照插入的顺序



大小


- Object通过Object.keys或者for...in遍历

- Set通过size获取大小



序列号
Object可以序列化和反序列化，Map只能序列化


应用场景


- Object


- 数据存储，属性为字符串

- 需要序列化

- 当作一个对象的实例，需要保存自己的属性和方法

- Map


- 会频繁和更新键值对

- 存储大量数据，尤其是key未知

- 需要频繁进行迭代处理




## Array和Set的区别


Array




- 有重复

- 速度慢 push O（1）unshift O（N）
Set

- 不重复

- 速度快 O（1）底层是哈希




## 手写debounce



```
function debounce(fn, wait, immediate = false){
    let time;
    let isInvoked = false;
    return function(...args){
        clearTimeout(time);
        if(immediate&&!isInvoked){
            fn.apply(this,args);
            isInvoked = true;
        }else{
            time = setTimeout(()=>{
                !immediate&&fn.apply(this,args);
                isInvoked = false;
            },wait)
        }
    }
}
```



## 手写throttle



```
function throttle(fn,wait){
    let time;
    return function(...args){
        if(!time){
            time = setTimeout(()=>{
                fn.apply(this,args);
                time=0;
            },wait)
        }
    }
}
```



## 手写eventEmitter



```
class EventEmitter{
    constructor(){
        this.events = {};
    }
    on(name,fn){
        if(typeof fn !=='function') return;
        this.events[name]?this.events[name].push(fn):this.events[name]=[fn]
    }
    emit(name,...args){
        this.events[name]&&this.events[name].forEach(fn=>fn&&fn(...args))
    }
    once(name,fn){
        const onceFn = (...args) => {
            fn&&fn(...args);
            this.removeListener(name);
        }
        this.on(name, onceFn)
    }
    removeListener(name){
        this.events[name]=[]
    }
}
```



## 性能指标有哪些




- TTFB：Time To First Byte，首字节时间

- FP：First Paint，首次绘制，绘制 Body

- FCP：First Contentful Paint，首次有内容的绘制，第一个 dom 元素绘制完成

- FMP：First Meaningful Paint，首次有意义的绘制

- TTI：Time To Interactive，可交互时间，整个内容渲染完成

- LCP:是 Largest Contentful Paint 最大内容绘制

- TBT 总阻塞时间

- CLS 累计布局偏移

- FID 首次输入延迟




## FP


白屏时间(First Paint)：是指浏览器从响应用户输入网址地址，到浏览器开始显示内容的时间。


中间会经历：DNS 查询、建立 TCP 连接、发送首个 http 请求，返回 html 文档、html 文档 head 解析完毕。



### 方法一：


通常浏览器认为开始渲染`<body>`或者解析完`<head>`的时间是白屏结束的时间点，按照这个思路可以进行代码实现



```
<head>
  <script>
    window.FPStart = new Date().getTime();
  </script>
  <link ref="" />
  <script src=""></script>
  <script>
    window.FPEnd = new Date().getTime();
    const FP = window.FPEnd - window.FPStart; //白屏时间
  </script>
  <head></head>
</head>
```


这个方法有个缺点：无法获取解析 HTML 文档之前的时间信息。



### 方法二


通过 window.performance.timing


domLoading - fetchStart


domLoading：浏览器开始解析网页 DOM 结构的时间。
chStart：浏览器发起 http 请求读取文档的毫秒时间戳。



## FCP


首屏时间(First Contentful Paint)：是指浏览器从响应用户输入网络地址，到首屏内容渲染完成的时间。



### 方法一


首屏结束时间应该是页面的第一屏绘制完，但是目前没有一个明确的 API 可以来直接得到这个时间点，所以我们只能智取，比如我们要知道第一屏内容底部在 HTML 文档的什么位置，那么这个第一屏内容底部，也称之为首屏线。不同型号手机屏幕不一样，所以只能估摸大概位置。


FCP 时间在 0-1.8 秒， 表示良好，FCP 评分将在 75~100 分；


FCP 时间在 1.9-3.0 秒， 表示需要改进，FCP 评分将在 50~74 分；


FCP 时间在 3.1 秒以上， 表示较差进，FCP 评分将在 0~49 分。


适用场景：




- 首屏内不需要拉取数据

- 不需要考虑图片加载



但是大部分页面都需要用到接口，所以这种方法不常用



### 方法二


统计首屏最慢图片加载时间
循环首屏每个图片，取图片加载最慢的值。


适用场景：


首屏元素数量固定的页面，比如移动端首屏不论屏幕大小都展示相同数量的内容。



### LCP


LCP 时间在 0-2.5 秒， 表示良好；


LCP 时间在 2.6-4.0 秒， 表示需要改进；


LCP 时间在 4.1 秒以上， 表示较差进