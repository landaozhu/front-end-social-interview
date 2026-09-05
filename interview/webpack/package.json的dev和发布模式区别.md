# package.json 的 dependencies 和 devDependencies 有什么区别？

【一句话】**dependencies 是运行时要带着的；devDependencies 只在开发/构建时用。** 发布和 CI 生产安装可以不装后者。

| | `dependencies` | `devDependencies` |
|---|---|---|
| 谁用 | 线上跑起来：vue、react、axios | 本地/CI 构建测：webpack、eslint、typescript、jest |
| `npm install` | 会装 | 会装 |
| `npm install --production` / `NODE_ENV=production` | 会装 | **跳过** |
| 打进浏览器包？ | 看你有没有 import；和这个字段不是一一对应 | 构建工具一般不进产物，但要装才能 build |

## 前端项目的容易混

SPA 最终是静态资源。`vue` 写在 dependencies 里，是因为源码 import 了它，构建时打进 bundle；`webpack` 放 devDependencies，线上 nginx 不需要 node_modules 里的 webpack。

**库作者**更要分清：你的包被别人 install 时，devDependencies **不会**装到使用方。把运行时依赖错放 dev，别人装完是坏的。

## 和 lock 的关系

生产 `npm ci --omit=dev` 仍然读 lock，只是不装 dev 那一段。没有 lock，生产解析出的 dependencies 树也可能漂。

## 追问

- **typescript 放哪？** 应用：devDependencies（编译完产物是 JS）。如果你发的是 TS 源码给别人编译，才可能进 dependencies。
- **peerDependencies？** 告诉宿主「请自己提供这个包」（如组件库对 react），避免打两份 React。
