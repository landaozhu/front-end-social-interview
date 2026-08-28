# 微信小程序熟悉吗？unionId / openId 是什么？

## 考察点

- 是否真做过小程序，还是只会 H5  
- 登录链路、用户标识、多端账号 — 二面爱问「union 什么东西」  
- 20k：能结合**选座小程序**业务讲

---

## 30 秒版

做过猫眼选座 **H5 + 微信小程序**。登录：`wx.login` 拿 code → **后端** `code2Session` 换 openId/session_key → 签发业务 token。**openId** 是单小程序用户 ID；**unionId** 是同一微信开放平台下多 App/小程序/公众号的**统一用户 ID**，用来打通账号。前端不存 session_key，只存业务 token。

---

## 2 分钟版

### 1. 核心概念（union 就是这个）

| 名称 | 含义 | 使用场景 |
|------|------|----------|
| **code** | `wx.login()` 返回，5 分钟有效，一次性 | 发给后端换 session |
| **openId** | 用户在**当前小程序**唯一标识 | 单应用识别用户 |
| **unionId** | **开放平台**下多应用统一标识 | 小程序 + H5 + App 同人判定 |
| **session_key** | 解密密钥 | **仅后端**，解密手机号等 |

**注意**：unionId 需要小程序绑定微信开放平台；没有绑定时只有 openId。

### 2. 标准登录流程

```
用户打开选座小程序
  → wx.login()（无感，不需用户点授权）
  → 前端 code 传猫眼后端
  → 后端 code2Session → openId (+ unionId)
  → 后端映射猫眼账号，返回 token
  → 前端 storage 存 token，请求带 Header
```

**手机号**：`getPhoneNumber` 按钮授权 → 后端用 session_key 解密。

### 3. 结合选座业务

- 测试环境：H5 `m.51ping.com/.../calendar`，小程序 `m.51ping.com/mysh/.../calendar`  
- **onShow 重要**：从票档返回选座，库存/售罄可能变，需刷新  
- **onLoad**：解析 scene/query（分享、扫码进页）  
- 页面栈深：下单完成用 `redirectTo`/`reLaunch` 清栈，避免超过 10 层  

### 4. 性能相关（小程序特有问题）

- **双线程**：逻辑层 JS + 渲染层 WXML，**setData 有成本**  
- 座位图：避免大块 setData，按区域更新  
- **分包**：主包体积限制，选座相关模块拆分  
- 日历高度：`createSelectorQuery` 测子组件高度 → 父组件更新 swiper（见 08 题）  

### 5. 和 uni-app 的关系（宏波项目）

宏波用 **uni-app** 做移动办公小程序，登录同样是 `uni.login` → 后端 code2Session，**openId/unionId 逻辑一致**，只是 API 统一为 `uni.*`。

---

## 常见追问

**Q：H5 和小程序怎么统一登录？**  
A：靠 **unionId** 或业务账号（手机号）绑定同一猫眼 userId；具体以后端账号体系为准，前端各端拿 token。

**Q：token 过期怎么办？**  
A：接口 401 拦截 → 静默 `wx.login` 重试一次 → 仍失败引导重新登录。

**Q：小程序能操作 DOM 吗？**  
A：不能，数据驱动；量高度用 `createSelectorQuery`。

**Q：web-view 用过吗？**  
A：内嵌 H5 可用；核心交易链路一般原生页，web-view 性能和登录传递更麻烦。

---

## 素材来源

- 简历：H5/小程序多端、uni-app
- wiki：C端选座测试前缀、自适应高度（小程序框架）
