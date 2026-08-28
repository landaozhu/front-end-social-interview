1. 通信成本高（最大问题）

父子应用天然隔离。

只能：

postMessage

同步：

登录态
用户信息
权限
主题切换
全局状态

维护成本高。

2. 路由体验差

iframe 内外 URL 不统一：

例如：

浏览器：

/main

实际页面：

/order/list

容易出现：

刷新异常
前进后退问题
分享链接失效
3. 用户体验差

常见问题：

双滚动条
iframe 高度自适应麻烦
弹窗被遮挡（z-index）
白屏加载
4. 性能较差

iframe 本质：

独立浏览器运行环境

容易重复加载：

Vue/React runtime
UI 库
JS 资源

内存开销更大。

什么时候还会用 iframe？

如果是第三方系统、老系统、无法改造的系统，iframe 反而是成本最低方案，因为它天然隔离、接入简单。

5. UI 无法统一（很重要，加分点）

iframe 本质：

独立 document（独立页面上下文）

导致：

弹窗无法穿透

父应用：

Modal
Loading
权限弹窗

无法真正覆盖 iframe。

z-index 无法跨 iframe 生效
下拉/弹层容易异常

例如：

Select
DatePicker
Tooltip
Dropdown

容易：

被裁剪
超出消失
层级错乱
Toast / Message 风格不统一

父子应用各一套 UI。

用户体验割裂。

追问：原题后半句——什么时候反而应该用 iframe？
第三方系统、改不了的老系统，iframe 天然隔离、接入成本最低，这时反而合适。