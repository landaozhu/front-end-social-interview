# uni-app 兼容题怎么答？

> 兼容题是 `14-uni-app项目经验` 的补充：**只记维护级常识 + 答法**，宏波**不展开**。  
> 主背选型逻辑见 **14**；本题答「遇到兼容怎么办」。

---

## 30 秒版

uni-app 兼容我按三步：**查官方 API 各端支持 → 不支持就用条件编译 `#ifdef` 隔离 → 真机验证**。常见问题就几类：safe-area、fixed+键盘、scroll-view 没高度、页面栈超 10 层、storage 超限、富文本受限。不装深，解决不了就查文档和小范围 ifdef，不大改架构。

---

## 兼容清单（按类记，够应付二面）

### 1. 条件编译

```javascript
// #ifdef MP-WEIXIN
// #endif

// #ifdef H5
// #endif

// #ifndef H5
// #endif
```

template / script / style 都能用。新增能力先查表，再决定要不要写 ifdef。

---

### 2. 样式

| 坑 | 处理 |
|----|------|
| **safe-area** | 底部按钮加 `env(safe-area-inset-bottom)` |
| **fixed + 键盘** | 输入框 `adjust-position`；或底栏改布局 |
| **rpx** | 跟 750 设计稿，少写死 px |
| **1px 边框** | scale 或组件库方案 |

**真机 > 开发者工具**（键盘、滚动、安全区）

---

### 3. API（uni.xxx）

| API | 注意 |
|-----|------|
| `uni.login` | 各端登录链路不同，小程序走 code2Session |
| `uni.navigateTo` | 栈最多 **10 层** → 结束用 `redirectTo` / `reLaunch` |
| `uni.setStorageSync` | 单 key ~1MB，总量有限制 |
| `uni.chooseImage` + `uploadFile` | 大小/格式限制，**fail 回调**要给提示 |
| `uni.getSystemInfoSync` | 取状态栏/安全区，别高频调 |
| `rich-text` | 不支持完整 HTML |

**习惯**：用前扫一眼 [官方 API 说明](https://uniapp.dcloud.net.cn/api/) 里的平台差异。

---

### 4. 组件 / 滚动

- **scroll-view**：必须设**明确高度**，否则「滚不动」  
- **swiper + 动态高度**：内容变化要算高，否则裁切  
- **input / picker**：iOS、Android 各点一遍  

---

### 5. 分包

微信主包 **2M** 左右限制，`pages.json` 里 `subPackages`。新增页面别全塞主包。

---

### 6. 组件库版本

uView / uni-ui 等要和 **HBuilderX、uni 编译器版本**匹配；升级先看 changelog，样式乱了先怀疑版本。

---

## 高频问法 + 短答

**Q：怎么做条件编译？**  
→ `#ifdef 平台`，隔离差异代码，见上文。

**Q：rpx 和 rem？**  
→ rpx 按屏宽 750 缩放；rem 相对根字体。uni 小程序侧常用 rpx。

**Q：真机不一致？**  
→ 以真机为准；工具仅冒烟。

**Q：性能怎么优化？**  
→ 维护级：分页、压图、少重复请求、storage 别太大。深度优化看原生/C 端场景，别在 uni-app 上吹架构。

**Q：和原生比兼容谁更烦？**  
→ uni-app 多一层**跨端差异**，要用条件编译和文档；原生是**单端 API**，跟平台走。所以**流量集中单端、能力要求高**时原生更省心 — 和 14 选型一致。

**Q：举个兼容 bug？**（通用模板，不绑宏波）

任选一句真话或类似经历：

- 底部按钮被 iPhone 横条挡 → safe-area  
- 流程结束栈太深 → `redirectTo`  
- 上传失败没提示 → 补 `fail` + 压缩  
- scroll-view 滚不动 → 补高度  

没有具体记忆：  
> 「多是真机样式、跳转栈、上传这几类，路径固定：复现 → 查文档 → ifdef 或小改，不大动架构。」

---

## 和 14 的分工

| 文件 | 答什么 |
|------|--------|
| **14** | uni-app 是什么、**和原生怎么选**（主背） |
| **41（本题）** | **兼容题**怎么答、记哪些坑 |

---

## 不要说的

- 宏波审批、5000 人、组长细节  
- 「uni-app 原理精通」  
- nvue / renderjs 没用过别装熟  
- 「全端都上过」

---

## 5 分钟速记

```
选型（14）：标准业务+真要多端 → uni-app；重能力/性能/单端流量 → 原生
兼容（41）：查表 → #ifdef → 真机
四类坑：safe-area | 页面栈10 | scroll高度 | storage/上传
宏波：早期维护接触过，不展开
```
