# uniapp 遇到小程序和 H5 兼容问题怎么解决？

【一句话】三步：**查官方各端支持 → 不支持就 `#ifdef` 隔离 → 真机验证。** 不大改架构。

## 根因

uni-app 是 Vue 语法编译到多端。H5 有 DOM/BOM，小程序是双线程 + 无 DOM，API、样式、组件能力都不一样。一套代码必然有分叉。

## 做法

```js
// #ifdef H5
window.location.href = url
// #endif

// #ifdef MP-WEIXIN
uni.navigateTo({ url })
// #endif
```

template / script / style 都能条件编译。

| 坑 | 处理 |
|---|---|
| API 不支持 | 先看 [uni API 平台差异](https://uniapp.dcloud.net.cn/api/)，再 ifdef |
| safe-area / 底部按钮 | `env(safe-area-inset-bottom)` |
| scroll-view 滚不动 | 必须写死高度 |
| 页面栈 > 10 | `redirectTo` / `reLaunch` |
| storage 超限 | 单 key ~1MB，分页、压图 |
| 富文本 | `rich-text` 不是完整 HTML |
| 登录 | H5 cookie；小程序 `uni.login` → code2Session |

真机 > 开发者工具（键盘、滚动、安全区）。解决不了就小范围 ifdef，不在 uni-app 上硬做原生才能做的能力。

## 追问

- **原理？** 编译期按平台剥代码，不是运行时 magically 一套 API 全通。
- **和原生小程序？** 流量集中单端、重交互/性能 → 原生更省心；标准业务真要多端 → uni-app。
- **简历？** 宏波早期维护过；猫眼选座是 H5/小程序分端，不是 uni-app。
