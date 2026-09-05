# Vue 和 React 有什么区别？

【一句话】都是组件化 + 虚拟 DOM，差在**响应式 vs 显式 setState**、**模板 vs JSX**、**谁来决定何时更新**。

| | Vue | React |
|---|---|---|
| 更新触发 | 改 data / ref 自动通知 | 必须 `setState` / `useState` |
| 视图 | 模板 + 指令 | JSX，逻辑都在 JS |
| 粒度 | 组件级 Watcher，改哪个字段更新谁更清楚 | Fiber 树调和，默认父更新子也 render（靠 memo 截） |
| 心智 | 框架帮你收集依赖 | 你自己声明「状态变了」 |
| TS | Vue3 才原生好 | JSX + 类型从一开始就顺 |

一面怎么选：不是谁更高级。C 端偏交互、要精细控制更新 → React；中后台表单多、要写得快 → Vue。简历两边都有，按业务选，不要贬其中一边。

## 追问

- **渲染机制差在哪？** Vue2：响应式收集 → 组件 Watcher → 异步队列 → vdom patch。React：setState 进更新队列 → Fiber reconcile（可打断）→ commit 改 DOM。
- **能互相替代吗？** 业务能替代，生态和招聘市场不能当没差。
- **和 jQuery？** jQuery 命令式改 DOM；Vue/React 是数据驱动，不直接操作节点。
