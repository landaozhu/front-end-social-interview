# 范特西首屏 userMenu 预加载方案

## 30 秒版

B 端范特西首屏被 **userMenu 接口阻塞**（vendor 加载完才请求，约 1s 延迟）。方案：在 **index.html 原生 ajax 预请求** userMenu，挂 `window.menuData`；js 侧优先读缓存，未完成则监听 `preGetUserMenuData` 事件；失败走原 axios **兜底**。优化约 **400–500ms**。

## 2 分钟版

**分析**  
- Performance：index.html 与 page/index.js 差约 1s  
- userMenu 阻塞路由/menu 渲染  

**方案 1 — window 绑定**  
- html 请求成功 → `window.menuData` → js 直接 `processRouter`  

**方案 2 — 事件**  
- html 请求未完成 js 已加载 → `document.dispatchEvent('preGetUserMenuData')` → js listen  

**方案 3 — 兜底**  
- 都失败 → 原 getUserMenuApi + axios 错误处理  

**为何不在 html 写死错误处理？**  
- html 失败难复用 axios 拦截器逻辑；预请求成功用缓存，失败走原链路  

**后续**  
- 后端优化 userMenu（原 700ms）  
- 拆 vendor.js 缩短 JS 加载  

**PR**：dev.sankuai.com code myshow-fantasy-h5 pr/1676  

## 素材来源：wiki 优化范特西首屏加载速度（简历 B 端性能相关）
