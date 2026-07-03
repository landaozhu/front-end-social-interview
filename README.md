# 大厂社招前端面试宝典

关键词：前端面试题库、大厂前端社招面试宝典、前端面试宝典、大厂面试题

## 介绍

这是一个针对大厂社招前端面试宝典。

市面上有很多面经，往往内容不够丰富，容易被挖深就答不出，又或者题目比较零散，本项目针对社招前端，系统且快速复习的需求，做了题目和答案的整理

## 社招面试题

### P5

- `|浏览器渲染原理`（原文整行保留；行末无第二个 `|`）
- **Css**（原「### Css」小标题，改为条目保留）
- **vue、react：组件传参，生命周期，状态管理**（原「### vue、react…」小标题，改为条目保留）
- **vue**（原「### vue」小标题；其下原文为空行，此处保留一条占位说明：原文该小节下无额外条目）
- **React**（原「### React」小标题下全文拆分为下列子项，措辞不增删）
  - context，
  - redux，
  - Mobx 的 object 和 map 有什么区别？底层实现？
  - Hooks 用过吗？
  - hooks 常用的几种
  - React18
  - [事件系统原理](interview/react/事件系统原理.md)
  - 框架：各自框架区别
  - 性能优化：说说优化，防抖原理
- **框架**（原「### 框架」小标题）
  - 谈谈 Vue 和 React 的区别？
- **框架与业务性能（仓库笔记）**
  - [React 优化](interview/react/优化.md)、[Vue 优化](interview/vue/优化.md)、[React 18 更新](interview/react/react18更新了什么.md)
  - [高性能渲染十万条数据](interview/js/高性能渲染十万条数据.md)
- **浏览器与运行时（具体题）**
  - [Event Loop](interview/浏览器/eventloop.md)、[Performance](interview/浏览器/performance.md)、[重绘与重排](interview/浏览器/重绘和重排.md)、[性能指标咋计算](interview/浏览器/性能指标咋计算.md)
- **HTML（具体题）**
  - [DOCTYPE](interview/html/doctype.md)、[语义化](interview/html/语义化.md)、[新特性](interview/html/新特性.md)、[块级元素与内联元素](interview/html/块级元素和内联元素.md)
- **CSS（具体题）**
  - [盒模型](interview/css/盒模型.md)、[BFC](interview/css/bfc.md)、[Flex](interview/css/flex.md)、[重排与重绘](interview/css/重排和重绘.md)、[伪类与伪元素](interview/css/伪类和伪元素.md)
- **JavaScript（具体题）**
  - [DOM](interview/js/dom.md)、[事件冒泡与捕获](interview/js/事件冒泡和事件捕获.md)、[模块化](interview/js/模块化.md)、[深拷贝与浅拷贝](interview/js/深拷贝和浅拷贝.md)、[防抖与节流](interview/js/防抖与节流.md)
- **ES5（具体题）**
  - [闭包](interview/es5/必包.md)、[this 指向](interview/es5/this指向.md)、[原型与原型链](interview/es5/原型和原型链.md)、[作用域](interview/es5/作用域.md)、[严格模式](interview/es5/严格模式.md)
- **ES6（具体题）**
  - [箭头函数](interview/es6/箭头函数.md)、[数组和 Set 的区别](interview/es6/数组和set的区别.md)、[Object 与 Map 的区别](interview/es6/Object和Map的区别.md)
- **TypeScript（具体题）**
  - [TypeScript 有啥好处](interview/ts/ts有啥好处.md)
- **Webpack（具体题）**
  - [Webpack 常用配置](interview/webpack/常用配置.md)
- **计算机网络**（原「### 计算机网络」小标题下全文保留；P5 高频）
  - http 和 https，header 参数，
  - [HTTP 状态码](interview/网络/http状态码.md)
  - [TCP 和 UDP 的区别](interview/网络/tcp和udp的区别.md)
  - [TCP 三次握手](interview/网络/三次握手.md)
  - [URL 输入后的过程](interview/网络/url输入到页面展示的过程.md)、[跨域](interview/网络/跨域.md)

### P6

- **项目：介绍、难点**（原「### 项目：介绍、难点」小标题，改为条目保留）
- **网络与安全（偏 P6：安全模型、攻防与合规追问）**
  - [网络与安全](interview/网络安全.md)
- **网络与基础设施追问（原出现在「### 数据结构：二叉树」标题之下的三条追问，移至此处归类，原文不增删）**
  - Websocket 怎么建立连接的？
  - 对 BFF 有什么理解？Node 为什么支持高并发？多线程除了上下文切换还有什么影响性能？
- **P6 技术路线（仓库文档）**
  - [P6 技术路线](P6技术路线.md)
- **Node 与服务端周边**
  - [Node 目录索引](interview/node/README.md)
- **工程化与构建（偏 P6：构建链路、体积与速度、插件与产物治理）**
  - [提高打包速度](interview/webpack/提高打包速度.md)、[减少包体积](interview/webpack/减少包体积.md)、[打包构建流程](interview/webpack/打包构建流程.md)、[Webpack 5 新特性](interview/webpack/webpack5新特性.md)、[TerserPlugin](interview/webpack/TerserPlugin.md)
- **状态与数据流**
  - [Redux](interview/redux.md)
- **设计模式（延展）**
  - [高频设计模式](article/高频设计模式.md)

### 顶尖大厂专项

- **es6：**（原「### es6：」小标题下全文保留）
  - let
  - const,
  - promise，
  - [箭头函数](interview/es6/箭头函数.md)
  - Proxy 了解多少？
- **数据结构：二叉树**（原「### 数据结构：二叉树」小标题保留；其下在原文中紧跟的三条追问已按你的要求整体挪动到 P6，不在此重复）
- **算法：**（原「### 算法：」与后文重复的「### 算法」两处「快排」合并为一条，不重复列出）
  - [快排](interview/algorithm/快排.md)
- **css**（原「### css」小标题）
  - [伪类和伪元素](interview/css/伪类和伪元素.md)
- **原文单独一行「-」（整行仅一个连字符）**

  ```text
  -
  ```

- **原文单独一行「###」（整行仅三个井号）**

  ```text
  ###
  ```
- **Promise / 异步规范（仓库手写笔记）**
  - [Promise A+（说明与推导）](interview/handwritten/promiseA+.md)、[Promise A+ 笔记稿](interview/handwritten/code/promiseA+/promise1.md)、[Promise A+ 代码目录说明](interview/handwritten/code/promiseA+/README.md)、[Promise 基础手写](interview/handwritten/promise.md)
- **语言与对象模型**
  - [call、apply、bind](interview/handwritten/call、apply、bind.md)、[new](interview/handwritten/new.md)、[深拷贝](interview/handwritten/深拷贝.md)、[Proxy](interview/handwritten/proxy.md)、[instanceOf（练习）](interview/handwritten/instanceOf.js)
- **事件、节流与并发原语**
  - [EventEmitter](interview/handwritten/eventEmitter.md)、[防抖](interview/handwritten/防抖.md)、[节流](interview/handwritten/节流.md)
- **样式加载器链路（实现向理解）**
  - [less-loader](interview/handwritten/less-loader.md)、[style-loader](interview/handwritten/style-loader.md)、[CSS 工程配置](interview/handwritten/css配置.md)
- **TypeScript 深水区（偏类型系统与工程化；与 P5「TypeScript 有啥好处」互补）**
  - [interface 与 type](interview/ts/interface和typeScript的区别.md)、[高级类型](interview/ts/高级类型.md)、[方法重载](interview/ts/方法重载.md)、[基本类型定义](interview/ts/基本类型的定义.md)
- **算法与数据结构精读（偏大厂高频题型精讲）**
  - [十大排序](interview/algorithm/十大排序算法.md)、[动态规划](interview/algorithm/动态规划.md)、[查找](interview/algorithm/查找.md)

## 面经（按公司划分）

[字节](compony/bytedance.md)

## 愿景

前端面试刷八股文，看这里就够了



https://www.bilibili.com/video/BV1Tx4y1E78g/?spm_id_from=autoNext&vd_source=1717bca8aebff18ca2591bd114c54e3f
