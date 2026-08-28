# Vue2 升 Vue3 / 重构踩过什么坑？

## 考察点

- 框架迁移真实经验，不是背 diff 文档
- 结合上单 2.0 + 选座 Vue3

---

## 30 秒版

上单 2.0 从 Vue2 迁 **Vue3 + Composition API + TS**。坑：**Options 大组件难拆** → composable 重构；**微前端子应用切换状态残留**；**TS 与后端接口不一致**导致联调返工；antd-vue 组件 API 变化（popover 等）。选座页 Vue3 用 composable 拆座位/票档/跳转逻辑。

---

## 2 分钟版

### 1. 语法与组织

| Vue2 | Vue3 实践 |
|------|-----------|
| Options 巨型组件 | composable：`useSeatMap`、`useTicketLevel` |
| mixins 来源不清 | composable 显式 import |
| `$listeners` 等移除 | 适配 ant-design-vue 3.x API |

### 2. 微前端 + Vue3 特有坑

- 子应用 unmount 时 **pinia/vuex 未重置** → 进下一项目看到脏数据  
- 全局组件/register 重复 → 主应用统一注册  
- 路由 base 与子应用 publicPath 不一致 → 静态资源 404  

### 3. TypeScript

- 接口类型以后端 swagger 为准，**先对齐类型再写 UI**  
- 条件退大量枚举：时间类型、审核状态 → 用 union type 防传错  

### 4. 组件库

- popover 取消不了（bug 1198725）→ 重新读 ant-design-vue 受控模式  
- 表单校验：自定义校验 + 表单校验分离，滚动定位  

### 5. 性能

- Vue3 Proxy 响应式：大数组座位图注意 **shallowRef** 或分片  
- `v-if` vs `v-show` 在座位图切换场景的选择  

### 6. 兼容 1.0 数据

- 2.0 页面要展示 1.0 场次限退等数据 — **兼容层**而非重写业务规则  

---

## 常见追问

**Q：为什么不用 React 重写？**  
A：团队 Vue 栈 + 微前端存量接入成本；业务交付优先。

**Q：Composition 比 Options 好在哪？**  
A：条件退这种**多 Tab 多表单**，逻辑按域聚合，测试和 Review 更清晰 — 我在组内分享过 ahooks/ hook 思想。

---

## 素材来源

- 简历：Vue3 重构、选座 Vue3
- wiki：新上单 bug（popover、重构导致问题 1198359）
