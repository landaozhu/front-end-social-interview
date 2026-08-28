# Vue 和 React 遇到的最大挑战是什么？

## 考察点

- 二面经典题 — 必须挂**自己的项目**
- 体现对比思考，不是站队

---

## 30 秒版

**Vue（猫眼）**：**复杂状态 + 多端 + 性能**同时成立 — 选座页场次/票档/座位/售罄状态，H5+小程序，首屏 2s→1.3s。**React（携程）**：**SSR 下首屏与数据一致性** — 地图+价格+列表，4s→2s，Google Map 只能客户端初始化。共性：**先度量再优化，用数据验收**。

---

## 2 分钟版

### Vue 侧 — 选座 + 上单

**挑战 1：状态维度多**  
- 场次 × 票档 × 座位 × 库存 × 审核/售卖状态（B 端）  
- 解法：状态机 + composable 分域；onShow 刷新库存  

**挑战 2：多端一致**  
- H5 vue-router vs 小程序页面栈；日历 swiper 高度  
- 解法：共享接口层，UI/容器分端适配  

**挑战 3：性能**  
- 串行接口 + 大包 + 小程序 setData  
- 解法：并行、分包、按需加载、高度缓存数组  

**挑战 4：B 端表单**  
- 条件退时间规则、销售计划联动  
- 解法：纯函数校验 + 自测矩阵 + 深拷贝纪律  

### React 侧 — Trip.com 地图

**挑战 1：SSR 与浏览器 API**  
- Google Map/Mapbox 依赖 window  
- 解法：SSR 预取酒店/价格；地图 dynamic import + hydrate 后 init  

**挑战 2：数据 waterfall**  
- 列表、价格、地图分开拉慢首屏  
- 解法：Java BFF **批量聚合**；React-Redux 同构数据  

**挑战 3：质量**  
- Jest 单测 + 堡垒/线上多环境 + CR  

### 对比总结（收尾金句）

| | Vue 项目 | React 项目 |
|---|----------|------------|
| 主要矛盾 | 业务状态 + 多端 | SSR 数据流 + 重资源首屏 |
| 我的角色 | 负责人/核心模块 | 地图模块 owner |
| 验证方式 | 真机 + 埋点 | Lighthouse + SSR 指标 |

> 我不纠结框架优劣，看**业务矛盾**选手段。

---

## 常见追问

**Q：你更熟悉哪个？**  
A：Vue 近三年更深（猫眼 B+C）；React 在携程核心链路打过底，能独立开发 SSR 页面。

**Q：Vue3 和 React Hooks 像吗？**  
A：Composable 和 Hooks 都是逻辑复用；我在组内分享过 options vs composition / class vs hook。

---

## 素材来源

- 简历：Vue3 选座、React SSR 地图
- wiki：转正 ahooks 分享、webpack lighthouse
