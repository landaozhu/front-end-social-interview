# 高频设计模式面试题（js）

> 来源: https://juejin.cn/post/7272191578826686516

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}什么是设计模式，它是解决某个特定场景下对某种问题的解决方案。总共有 23 种，有时间可以全部了解清楚，着急找工作的同学，时间紧任务重，我们只需要了解一些高频的就够了。



## 面向对象


封装继承多态，简易了解一下java的面向对象只是，js没有多态


js有哪些继承



## 工厂模式


用来创建对象的一种常用方式，如果对象有很多。


根据抽象程度不同分为三种类型




- 简单工厂模式

- 工厂方法模式

- 抽象工厂模式




### 简单工厂


简单工厂模式也叫静态工厂模式，用一个工厂对象创建同一类对象类的实例。


假设现在小明有两个手机的信息，一辆小米，一辆苹果



```
class Xiaomi(){
  constructor(){
    this.name='小米';
    this.price=2000;
  }
}
class Iphone(){
  constructor(){
    this.name='苹果';
    this.speed=6000;
  }
}
```


小黄想要知道，直接创建对象



```
const phone1 = new Xiaomi();
const phone2 = new Iphone();
```


如果小黄想要知道小明的所有手机信息，就得都知道类名


这里违反了一个设计原则：迪米特法则——最少知道原则


因此小明使用简单工厂方法重新修改



```
class Xiaomi(){
  constructor(){
    this.name='小米';
    this.price=2000;
  }
}
class Iphone(){
  constructor(){
    this.name='苹果';
    this.speed=6000;
  }
}
function PhoneFactory(){
    switch(type){
      case 'xiaomi':
        return new Xiaomi()
      case 'iphone':
        return new Iphone()
      default:
        throw new Error(`你说的${type}类型我不了解`)
    }
}
```


通过这样改造，小黄只需要知道 PhoneFactory 和对应的参数名单即可，参数名单可以写在 PhoneFactory 的说明文档，因此小黄只需要知道 PhoneFactory 这个类。



```
const phone1 = PhoneFactory("xiaomi");
const phone2 = PhoneFactory("iphone");
```


优点


- 消费者者不需要知道产品具体类名，只需要知道产品对应参数即可



缺点


- 工厂类集中了所有产品的创建逻辑，如果发生异常，整个系统都会发生故障

- 违反了开闭原则

- 使用了静态方法，无法继承



使用场景


- 创建的类比较少




### 工厂方法


小明通过简单工厂方法，在后续添加品牌的过程中，每次都得修改工厂方法。这里违反了开闭原则。


于是小明重新设计了一下。



如果能看懂 Java，最好是去看 Java 版，js 没有多态，如果用 Java 那种方式去些工厂方法，自己去模拟一个抽象方法，反而很奇怪，也没有意义。




```
function PhoneFactory{
    if (this instanceof PhoneFactory) {
      return new this[type]();
    } else {
      return new PhoneFactory(type);
    }
}
PhoneFactory.prototype = {
  HuaweiPhone: function () {
    this.name = "华为";
  },
  XiaomiPhone: function () {
    this.name = "小米";
  },
  //只需要在这里添加就行
};
const phone1 = new PhoneFactory("HuaweiPhone");
const phone2 = PhoneFactory("XiaomiPhone");
```



### 抽象工厂


小米和华为除了手机，还有其他产品平板等，如果使用工厂方法，就得定义平板等多个工厂方法，因此可以用抽象工厂。



```
class IFactory{
  createPhone(){
    return '不要调用，createPhone是抽象方法'
  },
  createIpad(){
    return '不要调用，createIpad是抽象方法'
  },
}
class XiaomiFactory extends IFactory{
  createPhone(){
    return new XiaomiPhone();
  }
  createIpad(){
    return new XiaomIPad();
  }
}
class HuaweiFactory extends IFactory{
  createPhone(){
    return new HuaweiPhone();
  }
  createIpad(){
    return new HuaweiIPad();
  }
}
const xiaomiPhone = XiaomiFactory.createPhone();
const huaweiIPad = HuaweiFactory.createIpad();
```



## 单例模式


定义：一个类只有一个实例



```
class SingleDog {
  show() {
    console.log("我是一个单例对象");
  }
  static getInstance() {
    // 判断是否已经new过1个实例
    if (!SingleDog.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      SingleDog.instance = new SingleDog();
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return SingleDog.instance;
  }
}

const s1 = SingleDog.getInstance();
const s2 = SingleDog.getInstance();

// true
s1 === s2;
```



### 应用场景




- vuex，确保 store 的唯一性

- 组件库的弹窗




## 观察者模式


产品拉了一个群，群里有开发、测试、UI，产品说要进行第二次改版，于是决定下周一之前更新第二版 prd，开发、测试、UI 等着 prd 更新之后，进行第二版功能迭代。这里就用到了观察者模式



观察者模式定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个目标对象，当这个目标对象的状态发生变化时，会通知所有观察者对象，使它们能够自动更新。



这里的产品是发布者，开发、测试、ui 是观察者。


代码实现



```
// 定义发布者类
class Publisher {
  constructor() {
    this.observers = [];
    console.log("Publisher created");
  }
  // 增加订阅者
  add(observer) {
    console.log("Publisher.add invoked");
    this.observers.push(observer);
  }
  // 移除订阅者
  remove(observer) {
    console.log("Publisher.remove invoked");
    this.observers.forEach((item, i) => {
      if (item === observer) {
        this.observers.splice(i, 1);
      }
    });
  }
  // 通知所有订阅者
  notify() {
    console.log("Publisher.notify invoked");
    this.observers.forEach((observer) => {
      observer.update(this);
    });
  }
}
// 定义订阅者类
class Observer {
  constructor() {
    console.log("Observer created");
  }

  update() {
    console.log("Observer.update invoked");
  }
}
const p = new Publisher();
const o1 = new Observer();
const o2 = new Observer();
const o3 = new Observer();
p.add(o1);
p.add(o2);
p.add(o3);
p.notify();
```


这里的观察者和被观察者只是抽象类，具体可以看这里



### 优缺点


优点


- 两者抽象耦合，降低了观察者与被观察者的耦合关系

- 建立了一套触发机制，形成了一条触发链

- 易扩展



缺点


- 如果一个被观察者对象有很多直接和间接的观察者的话，将所有的观察者都通知到要花费很多时间

- 如果观察者和被观察者之间有循环依赖，观察目标会触发它们之间进行循环调用，可能导致系统崩溃

- 观察者模式没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的，而仅仅只是知道观察目标发生变化了




### 应用场景




- vue 的双向数据绑定




```
// 创建对象
var targetObj = {
  name: "小李",
};
var targetObj2 = {
  name: "小李",
};
// 定义值改变时的处理函数（观察者）
function observer(oldVal, newVal) {
  // 其他处理逻辑...
  targetObj2.name = newVal;
  console.info("targetObj2的name属性的值改变为 " + newVal);
}

// 定义name属性及其set和get方法（name属性为被观察者）
Object.defineProperty(targetObj, "name", {
  enumerable: true,
  configurable: true,
  get: function () {
    return name;
  },
  set: function (val) {
    //调用处理函数
    observer(name, val);
    name = val;
  },
});

targetObj.name = "张三";
targetObj.name = "李四";
console.log(targetObj2.name);
```




- RxJs




## 发布订阅模式


发布订阅模式最容易和观察者模式混淆，网上很多文章把发布订阅模式和观察者模式混为一谈，其实这是两个概念。

观察者模式不需要通过调度中心，而发布订阅需要调度中心。
观察者是一对多的关系，发布订阅模式是多对多的关系。
最常见的就是 eventEmitter，也经常用来出手写题，写出来也就掌握了。


实现一个 eventEmitter，包含 on、once、emit、removeListener 方法
on 订阅
once 只能注册一次
emit 发布
removeListener 取消订阅



```
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(name, fn) {
    this.events[name] ? this.events[name].push(fn) : (this.events[name] = [fn]);
  }
  emit(name, ...args) {
    const fns = this.events[name];
    fns.forEach((fn) => fn && fn(...args));
  }
  once(name, fn) {
    const onceFn = (...args) => {
      fn && fn(...args);
      this.removeListener(name);
    };
    this.on(name, onceFn);
  }
  removeListener(name) {
    this.events[name] = [];
  }
}
```



### 优缺点


优点


- 时间解藕，发布者与订阅者双向解藕

- 支持异步处理,可以实现事件的延迟触发和批量处理

- 支持多对多通信，可以实现组播和广播功能



缺点


- 如果一个订阅者很多的话，将所有的订阅者都通知到要花费很多时间

- 发布者无法得知订阅者的执行情况

- 内存泄露，如果订阅者没有取消订阅

- 增加程序复杂性，如果订阅者过多或依赖关系不清晰，会增加程序的调试难度




### 应用场景




- addEventListener 事件监听

- NodeJs 的 EventEmitter 模块




### 适用场景




- 当一个对象的状态变化需要通知其他多个对象时，可以使用发布订阅模式来实现松耦合的通信

- 当一个事件或消息需要广泛传播或分发给多个接收者时，可以使用发布订阅模式来实现高效的消息分发

- 当一个系统需要支持异步处理或批量处理时，可以使用发布订阅模式来实现事件的延迟触发或批量触发




## 迭代器模式


定义：在不暴露对象内部结构的同时，可以顺序地访问聚合对象内部的元素


比如说我们现在要遍历一个数组[1,5,3,6]



```
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```


那有没有不需要用 for 循环，就可以实现呢
于是就有了 forEach



```
function forEach(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    fn(arr[i], i, arr);
  }
}
forEach(arr, (item, index) => {
  console.log(item);
});
```


这就是迭代器


为什么要设计迭代器模式呢？


可以使程序清晰易读，比如说 forEach，就不需要自己手动 for


再比如只要基数，如果不用迭代器
就得这么写



```
let res = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 !== 0) {
    res.push(arr[i]);
  }
}
```


有了迭代器帮你实现



```
function filter(arr, fn) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    const filteredItem = fn(arr[i], i, arr);
    if (filteredItem) {
      res.push(filteredItem);
    }
  }
  return res;
}
```


这样调用起来就简便很多了。



```
filter(arr, (item, index) => item % 2 !== 0);
```


以上说的仅仅是数组迭代器


还有对象迭代器


我们如果要遍历一个对象的属性，一般用 for in，那么这个是不是可以封装成一个迭代器



```
function objectForEach(obj, fn) {
  for (let key in obj) {
    fn(key, obj[key], obj);
  }
}
const student = {
  name: "lwp",
  age: 23,
};
objectForEach(student, (key, value, obj) => {});
```


这些都只是内部迭代器，还有外部迭代器


内部迭代器的优点是调用的时候很方便，不需要关心内部实现，缺点是迭代规则已经被提前规定，不灵活，无法实现复杂遍历需求


而外部迭代器的优点则是更灵活，能处理复杂的需求，缺点是得手动迭代，适用方式比较复杂。


实现一个外部迭代器



```
const Iterator = function (obj) {
  let index = 0;
  const next = () => {
    index++;
  };
  const isDone = function () {
    return index === obj.length;
  };
  const getCurrentItem = () => {
    return obj[i];
  };
  return {
    next,
    isDone,
    getCurrentItem,
  };
};
```



### 应用场景




- forEach

- filter

- map

- reduce

- find

- some

- every

- generator

- 轮播图，定时轮播，前一张后一张

- Iterator




## 装饰器模式


定义：在不改变原对象的基础上，通过对其进行包装拓展（添加属性或方法）使原有对象可以满足用户的更复杂需求


定义一个计算函数



```
function calculate(num) {
  let result = 0;
  for (let i = 0; i < num; i++) {
    result += i;
  }
  return result;
}
calculate(10000);
```


假设说 calculate(100000)被调用了很多次，每次都得重新计算，那么就会很消耗性能，因此这里用缓存代理的思想，只要参数一致，就进行缓存。结合装饰器模式，写一个装饰器函数。



```
function catchFn(fn){
  const catch = new Map();
  return function(num){
    if(catch.has(num)){
      return catch.get(num)
    }else{
      const result = fn(num);
      catch.set(num,result);
      return result;
    }
  }
}
cosnt cachedCalculate = catchFn(calculate);
cachedCalculate(10000)
```



## 代理模式


定义：由于一个对象不难直接访问另一对象，所以需要通过代理对象在这两个对象之间起到中介的作用。


就比如说你要买韩国的一些衣服，你又不在韩国，所以找个代购帮你买。


再比如跨域，由于同源策略，直接进行 http 请求不到，就可以通过 img 来进行请求，或者 JSONP 来进行请求，他们是没有同源策略的限制的。



### 代理的类型




- 事件代理




```
<body>
  <div id="father">
    <div class="son1"></div>
    <div class="son2"></div>
  </div>
  <script>
    var div = $("#father");
    div.on("click", function (e) {
      var target = e.target;
      if (target.className === "son1") {
      }
    });
  </script>
</body>
```




- 应用：jq 的事件代理

- 虚拟代理（把一些开销很大的对象，延迟到真正需要它的时候才去创建执行）


- 应用：图片预加载

- 缓存代理（为开销大的运算结果提供缓存,通过参数缓存结果，下次判断参数一致直接返回缓存的结果）

- 保护代理（用于对象应该有不同访问权限的情况）


- 应用：proxy、axios 的拦截器 interceptor




## 参考


15 分钟入门 23 种设计模式：图解，范例和对比
前端 JS 高频面试题---2.单例模式
前端 JS 高频面试题---6.观察者模式/观察者与发布订阅的区别
观察者模式应用场景
vue.js 观察者模式+双向绑定
前端设计模式之发布订阅模式
js 设计模式——发布订阅模式




- 前端 JS 高频面试题---5.迭代器模式

- JavaScript 设计模式——代理模式

- javascript 中的设计模式之代理模式

- JavaScript 代理模式之四大代理

- 前端 JS 高频面试题---3.代理模式

- 几分钟时间，试着学一下抽象工厂模式-Java

- 前端设计模式：工厂模式（Factory）