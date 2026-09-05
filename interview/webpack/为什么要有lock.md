# 为什么要有 lock 文件？

【一句话】**package.json 写范围，lock 钉死精确版本。** 没有 lock，A 机器和 CI 可能装到不同的间接依赖，出现「我这能跑、线上挂了」。

## package.json 不够

```json
"lodash": "^4.17.20"
```

`^` 允许 4.17.21、4.18.0。间接依赖（lodash 自己的 deps）更是漂的。两次 `npm install` 解析树可以不一样。

## lock 干什么

`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` 记录：

- 每个包的**精确版本**和 integrity hash
- 完整依赖树（含间接依赖）

`npm ci` 按 lock 装，不重新解析，比 `npm install` 更适合 CI。

## 面试怎么说

1. 保证开发 / 测试 / 生产依赖树一致  
2. 安全：能对照审计，hash 对不上就失败  
3. 可回滚：lock 进 git，出问题能复现当时那棵树  

**lock 要提交。** `.gitignore` 掉 lock 是错的（库项目有时只发 package.json，应用项目必须交 lock）。

## 追问

- **和 package.json 谁说了算？** 有 lock 时安装器以 lock 为准；改了 package.json 再 install 会重算并改 lock。
- **为什么升级 lock 构建就变了？** 间接依赖被解析到新版本，可能修好 bug 也可能引入 breaking。所以要在 CI 跑测，不要随手升。
