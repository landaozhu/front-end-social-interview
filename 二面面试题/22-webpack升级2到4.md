# webpack 2 升级到 4 怎么做的？

## 考察点

- 工程化硬实力 — 简历有明确数据
- 能否说原则、步骤、踩坑

---

## 30 秒版

order-h5 项目 webpack **2.1 → 4**，分步 2→3→4（未一步升 5，ejs loader 不支持）。原则：**构建变快、线上性能不倒退**。结果：dev 首次 **50s→21s**，热更新 **15s→4s**；Lighthouse 选座相关页性能基本持平。负责全部开发任务。

---

## 2 分钟版

### 背景

- webpack2 编译极慢，开发和发布体验差  
- 转正材料：app-new-show-order 项目  

### 升级策略

1. **分阶段**：2→3→4，每步可回滚、可对比  
2. **度量**：speed-measure-webpack-plugin 找慢 loader/plugin  
3. **对比表**（wiki 真实数据）  

| 版本 | dev 首次 | dev 热更新 | build |
|------|----------|------------|-------|
| webpack2 | 50091ms | 14691ms | ~96s |
| webpack4 | 21286ms | 3749ms | ~25s |

4. **线上验证**：seat-area、select-seats、pre-order 等页 Lighthouse 对比 FCP/LCP/TBT  

### 同步升级

- 相关 loader、**手势库**（hammer 等）  
- **拆包**：build 体积变大但加载更优 — 配合 CDN  

### 踩坑

1. **手势库升级未验证** → 选座无法缩放 — 升级必须回归核心交互  
2. **sourcemap 误上生产** → 包变大扛不住大流量 → CDN 迁移 + 拆包  
3. **webpack5 暂缓**：ejs 无匹配 loader，需自研 — 务实停在 4  

### 为什么线上性能「基本不变」是 success？

- 目标首先是**研发效率**；用户侧指标未退化即达标  
- 拆包后部分页 FCP 略好  

---

## 常见追问

**Q：为什么不一上 webpack5？**  
A：依赖链 blocker（ejs loader）；4 已满足构建提速，5 收益/风险比不够。

**Q：拆包策略？**  
A：按路由/ vendor 分离；避免单 chunk 过大；配合动态 import。

---

## 素材来源

- 简历：webpack 2→4，50s→20s
- wiki：h5-order webpack升级 index、转正 2.1
