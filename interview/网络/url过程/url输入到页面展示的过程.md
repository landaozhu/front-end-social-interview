# URL 输入后发生了什么



## 导航阶段 (Navigation)

- 用户输入与解析： 用户在地址栏输入 URL，浏览器会解析这个 URL，判断是搜索内容还是一个合法的网址。
- DNS 解析： 浏览器首先会查找各级缓存（浏览器缓存、操作系统缓存、路由器缓存、ISP 缓存），看是否有该域名对应的 IP 地址。如果都没有，则会向根域名服务器发起递归查询，最终获取到目标服务器的 IP 地址。
- 建立 TCP 连接： 浏览器利用 IP 地址和端口号，与服务器进行“三次握手”，建立一个可靠的 TCP 连接。
- TLS 握手： 如果是 HTTPS 协议，还需要在 TCP 连接之上进行 TLS/SSL 握手，协商加密密钥，建立安全的加密通道。
- 发送 HTTP 请求： 浏览器构建一个 HTTP 请求报文（包含请求行、请求头、请求体），通过建立好的连接发送给服务器。
可观测点： 浏览器开发者工具的Network面板可以清晰地看到这个阶段的耗时，包括DNS Lookup,Initial connection,SSL/TLS handshake以及Time to First Byte (TTFB)。TTFB是一个关键指标，它衡量了从请求发出到收到服务器第一个字节响应的时间。
## 响应与解析阶段 (Response & Parsing)

- 服务器处理与响应： 服务器接收到请求后，进行处理（查询数据库、执行业务逻辑等），然后返回一个 HTTP 响应报文（包含状态码、响应头、响应体）。响应体通常就是 HTML 文档。
- 解析 HTML 构建 DOM 树： 浏览器接收到 HTML 后，渲染引擎会自上而下逐行解析，生成一个树状结构的 DOM (Document Object Model) 对象。
- 解析 CSS 构建 CSSOM 树： 在解析过程中，如果遇到 CSS 链接或样式代码，会去加载并解析 CSS，生成 CSSOM (CSS Object Model) 树。CSS 的解析不会阻塞 DOM 的解析。
- JavaScript 的执行： 如果遇到<script>标签，浏览器会暂停 HTML 的解析，转而去下载并执行 JavaScript。因为 JS 可能会修改 DOM 和 CSSOM，所以需要阻塞以保证后续解析的正确性。可以通过defer或async属性来改变这一行为。
可观测点： 开发者工具的Performance面板可以录制加载过程，观察到Parse HTML,Parse Stylesheet等事件。
## 渲染阶段 (Rendering)

- 构建渲染树 (Render Tree)： 将 DOM 树和 CSSOM 树结合起来，生成渲染树。渲染树只包含需要显示在页面上的节点及其样式信息（例如display: none的节点不会出现在渲染树中）。
- 布局 (Layout / Reflow)： 根据渲染树，计算出每个节点在屏幕上的精确位置和大小。这个过程也称为“回流”或“重排”。
- 绘制 (Paint / Repaint)： 根据布局阶段计算出的信息，将每个节点绘制到屏幕上，包括文本、颜色、边框、阴影等。这个过程也称为“重绘”。
- 合成 (Compositing)： 浏览器会将页面的不同部分（特别是涉及动画、transform等属性的元素）提升到独立的“层”中。当这些层发生变化时，浏览器只需重新绘制该层，然后将所有层合并（合成）到屏幕上，而无需对整个页面进行重排和重绘，极大地提高了性能。
可观测点： Performance面板中的Recalculate Style,Layout,Paint,Composite Layers事件详细记录了这一阶段的开销。频繁的Layout(回流) 是前端性能优化的重点关注对象。
收起解题思路
上一题
下一题
题目讨论

## DNS查询
## TLS握手
## defer async
async：下载完立刻执行（埋点、广告、第三方插件）
defer：页面解析完再执行（可以先下后执行）
## 缓存（协商缓存）