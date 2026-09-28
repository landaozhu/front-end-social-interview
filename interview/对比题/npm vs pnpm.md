
第二篇：npm vs Yarn vs pnpm
一、面试官问：npm、Yarn、pnpm 有什么区别？
1. 标准面试回答（建议 1～2 分钟）

npm、Yarn 和 pnpm 都是 JavaScript 包管理工具，主要负责依赖安装、版本管理、依赖解析和项目脚本执行。

它们最大的区别在于依赖的存储方式、node_modules 的组织结构、依赖隔离机制以及安装性能。

我主要从四个方面理解。

第一，依赖安装机制不同。

npm 早期采用嵌套式依赖结构，npm v3 开始采用扁平化安装策略，尽量将依赖提升到顶层 node_modules，减少重复安装和过深的目录层级。

Yarn Classic 也采用类似的扁平化安装方式，并引入了锁文件等机制来改善依赖安装的可重复性。

pnpm 则采用内容可寻址存储和符号链接机制。相同内容的包文件可以在不同项目之间复用，减少重复存储。

第二，依赖隔离不同。

npm 和 Yarn Classic 由于依赖提升，可能出现幽灵依赖问题。

也就是说，项目没有在 package.json 中声明某个包，但因为其他依赖将它带入了顶层 node_modules，项目代码仍然可能导入成功。

pnpm 默认通过其依赖链接结构限制项目直接访问未声明的依赖，从而减少这类问题。

不过，pnpm 也可以配置依赖提升，因此不能认为它在任何配置下都绝对严格。

第三，安装速度和磁盘占用不同。

pnpm 可以复用全局内容存储中的包文件，通过硬链接等机制减少重复写入和磁盘占用。

npm 和 Yarn 也具有缓存和并行安装能力，现代版本的性能已经有很大改善。

因此，pnpm 在多项目、依赖重复度高的场景中通常有存储优势，但具体安装速度仍需要结合缓存状态、文件系统和项目规模测试。

第四，Monorepo 支持不同。

npm、Yarn 和 pnpm 都支持 Workspaces。

pnpm 通过 pnpm-workspace.yaml 管理工作区，支持依赖过滤和指定包执行命令，适合管理多个应用和共享组件包。

Yarn 现代版本还提供 Plug'n'Play（PnP）等安装模式，可以不使用传统的 node_modules 结构。

如果是新建的中大型前端 Monorepo，我会优先评估 pnpm；如果是已有项目，则首先考虑现有工具链兼容性和迁移成本。

二、先理解：为什么需要包管理工具？

假设一个 React 项目需要安装：

npm install react react-dom axios

包管理工具主要负责以下事情：

读取 package.json
        ↓
解析依赖及版本范围
        ↓
构建依赖关系
        ↓
下载或复用缓存
        ↓
组织依赖文件
        ↓
生成或更新 lockfile

例如：

{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.7.0"
  }
}

这里的 ^18.2.0 并不是固定版本，而是一个版本范围。

对于 React 18.2.0，它通常允许安装：

>=18.2.0 且 <19.0.0

因此，如果没有锁文件，不同时间安装依赖，可能解析出不同的具体版本。

这就是为什么包管理工具需要 lockfile。

三、核心原理：三种工具如何组织 node_modules？

这是整篇文章最重要的部分。

1. npm：扁平化依赖结构

假设项目依赖：

项目
├── package-a
│   └── lodash
└── package-b
    └── lodash

如果两个包依赖兼容的 lodash 版本，npm 可以把 lodash 提升到顶层。

node_modules/
├── package-a/
├── package-b/
└── lodash/

这样可以减少重复安装。

但如果两个包依赖不兼容的 lodash 版本，就可能出现：

node_modules/
├── package-a/
├── package-b/
│   └── node_modules/
│       └── lodash@3/
└── lodash@4/

npm 会根据依赖关系和版本约束决定具体的安装位置。

因此，扁平化并不意味着所有依赖都只存在于顶层。

2. npm 为什么要采用扁平化？

npm 早期使用嵌套式安装：

node_modules/
└── A/
    └── node_modules/
        └── B/
            └── node_modules/
                └── C/

这种结构存在一些问题：

相同依赖可能被重复安装。

目录层级很深。

早期 Windows 环境可能遇到路径长度限制。

大量重复文件增加磁盘占用。

扁平化安装可以减少重复依赖和目录深度。

但它也带来了一个典型问题：幽灵依赖。

四、什么是幽灵依赖（Phantom Dependencies）？

假设项目的 package.json：

{
  "dependencies": {
    "package-a": "1.0.0"
  }
}

而 package-a 内部依赖 lodash：

{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

npm 可能生成以下结构：

node_modules/
├── package-a/
└── lodash/

此时，项目并没有声明 lodash，但下面的代码可能正常运行：

import lodash from 'lodash';

为什么？

因为 Node.js 的模块解析机制会沿着目录向上查找 node_modules。

当 lodash 被提升到项目顶层时，项目代码就能找到它。

但项目并没有显式声明这个依赖。

幽灵依赖有什么风险？

假设后来升级 package-a，它不再依赖 lodash。

重新安装后，lodash 可能从 node_modules 中消失。

项目代码就会报错：

Cannot find module 'lodash'

也就是说，项目依赖了一个没有声明的包，稳定性取决于其他包的依赖关系。

解决方案：直接使用的依赖必须显式声明在自己的 package.json 中。

pnpm 默认的依赖布局可以帮助发现这类问题，但仍应通过依赖声明规范、Lint 和 CI 检查来保证正确性。

五、pnpm 为什么更节省磁盘空间？

pnpm 的核心是内容可寻址存储（Content-addressable Store）。

先看传统安装方式的简化模型：

项目 A/node_modules/lodash
项目 B/node_modules/lodash
项目 C/node_modules/lodash

如果三个项目安装了相同版本的 lodash，传统的项目目录中可能存在多份包文件。

虽然 npm 和 Yarn 也有下载缓存，但缓存不等于项目中的依赖文件一定被共享。

pnpm 则将包文件存储在统一的内容可寻址存储中。

             pnpm Store
                 │
          lodash 的文件内容
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     项目 A     项目 B     项目 C

相同内容的文件可以被复用。

1. 什么是内容可寻址存储？

传统存储通常根据文件路径寻找文件。

内容可寻址存储则根据文件内容生成的哈希标识文件。

简化理解：

文件内容
   ↓
计算 Hash
   ↓
根据 Hash 存储和查找

如果两个包包含内容相同的文件，就有机会复用同一份存储内容。

pnpm 的实际 Store 结构与具体版本和配置有关，不需要记忆内部哈希目录的细节。

2. pnpm 如何把 Store 中的文件放进项目？

pnpm 通常通过硬链接等机制，将 Store 中的包文件关联到项目的虚拟存储目录。

再通过符号链接构建依赖关系。

需要区分两个概念：

| 机制 | 作用 |
|------|------|
| 硬链接（Hard Link） | 让多个路径指向同一文件内容 |
| 符号链接（Symbolic Link） | 通过一个路径指向另一个路径 |


硬链接可以让多个项目复用相同的文件数据，减少重复存储。

符号链接则用于组织包之间的依赖关系。

需要注意，硬链接通常要求源文件和目标文件位于同一文件系统。跨文件系统时，pnpm 可能使用复制等其他导入方式。

所以不能简单地说 pnpm 永远只创建硬链接。

六、pnpm 的 node_modules 到底长什么样？

假设项目直接依赖：

{
  "dependencies": {
    "express": "4.18.2"
  }
}

而 Express 又依赖其他包。

pnpm 的简化目录结构如下：

node_modules/
│
├── express
│   └── 符号链接 → .pnpm/express@4.18.2/node_modules/express
│
└── .pnpm/
    │
    ├── express@4.18.2/
    │   └── node_modules/
    │       ├── express/
    │       └── accepts
    │           └── 符号链接 → accepts 对应目录
    │
    └── accepts@1.3.8/
        └── node_modules/
            └── accepts/

这里有两层关键结构。

第一层：项目顶层 node_modules。

主要暴露项目直接声明的依赖。

node_modules/express

第二层：node_modules/.pnpm。

存放依赖包的虚拟存储目录，并通过链接组织包之间的依赖关系。

例如：

express → accepts

Express 可以访问自己的依赖 accepts。

但是项目代码不应该因为 Express 依赖 accepts，就直接使用 accepts。

追问：为什么 pnpm 要使用这种结构？

主要有三个原因：

通过全局 Store 复用文件，减少重复存储。

通过链接构建依赖关系，避免大量重复的嵌套目录。

限制项目直接访问未声明的传递依赖，减少幽灵依赖。

这也是 pnpm 和 npm、Yarn Classic 最核心的实现差异之一。

七、pnpm 为什么不直接把所有依赖都放进 Store？

因为 Node.js 和大量构建工具需要通过文件路径解析依赖。

如果只是把文件放进全局 Store，而没有在项目中建立对应的依赖关系，Node.js 就无法按照常规模块解析规则找到它们。

因此 pnpm 需要在项目中构建 node_modules 结构。

它不是完全取消 node_modules，而是通过虚拟存储目录和链接，组织出一个兼容 Node.js 模块解析机制的依赖结构。

另外，Node.js 默认通常会解析符号链接的真实路径，再从真实路径所在位置查找依赖。

pnpm 利用这一行为，让包可以访问它自己声明的依赖。

这也是 pnpm 依赖隔离机制能够工作的关键。

八、Yarn 到底有什么特别的？

不能把 Yarn 简单理解成另一个 npm。

需要区分两个阶段：

Yarn Classic（1.x）

Yarn Modern（2.x 及之后的现代版本）

1. Yarn Classic

Yarn Classic 主要采用传统的 node_modules 安装方式。

它在早期 npm 生态中提供了锁文件、并行安装和离线缓存等能力，改善了当时的安装体验。

但这些功能并不是今天 Yarn 独有的，现代 npm 同样支持锁文件、缓存和 Workspaces 等功能。

2. Yarn Modern：Plug'n'Play

Yarn Modern 的一个重要特性是 Plug'n'Play，简称 PnP。

传统 Node.js 项目通常通过 node_modules 查找依赖。

而 Yarn PnP 可以不生成传统的 node_modules 目录。

它会生成类似下面的文件：

.pnp.cjs

该文件记录依赖关系及包的位置，并通过相应的运行时解析机制，让 Node.js 能够定位依赖。

简化理解：

传统 node_modules

import react
    ↓
查找 node_modules
    ↓
找到 react
Yarn PnP

import react
    ↓
PnP 解析机制
    ↓
根据依赖映射找到 react

PnP 还能根据依赖声明检查访问权限，帮助发现幽灵依赖。

3. Yarn PnP 有什么缺点？

部分工具默认依赖传统 node_modules 的目录结构。

例如，一些旧版构建工具、插件或直接扫描文件系统的脚本，可能无法直接兼容 PnP。

需要配置适配、升级工具，或者切换安装模式。

现代 Yarn 也支持使用传统 node_modules 的安装方式。

因此，Yarn Modern 不等于一定使用 PnP。

九、lockfile 有什么用？为什么三个工具不能混用？

三个工具使用不同的锁文件。

| 工具 | 锁文件 |
|------|--------|
| npm | package-lock.json |
| Yarn | yarn.lock |
| pnpm | pnpm-lock.yaml |


1. package.json 和 lockfile 有什么区别？

package.json 主要描述项目需要什么依赖，以及允许的版本范围。

例如：

{
  "dependencies": {
    "axios": "^1.7.0"
  }
}

lockfile 则记录实际解析出的依赖版本及依赖关系等信息。

例如：

axios@1.7.2
    ↓
follow-redirects@1.x
    ↓
其他传递依赖

这是示意，具体锁文件格式因工具而异。

锁文件不仅记录直接依赖，也会记录传递依赖。

它的目的在于让不同开发者和 CI 环境尽可能安装出一致的依赖关系。

但锁文件不意味着不同操作系统、CPU 架构下的实际安装文件必然完全相同，因为还可能存在平台相关的可选依赖和安装脚本。

2. 为什么不能混用？

假设项目原本使用 pnpm：

package.json
pnpm-lock.yaml

开发者突然执行：

npm install

npm 可能生成：

package-lock.json

这样项目就存在两份由不同工具维护的锁文件。

它们可能解析出不同的依赖版本或依赖结构。

不同开发者、CI 环境使用不同工具时，就可能出现本地正常、线上异常的问题。

因此，团队应统一包管理工具及其版本，并且只维护对应的锁文件。

十、npm install、npm ci、pnpm install 有什么区别？

这是实际工程中经常被追问的问题。

1. npm install
npm install

主要用于开发环境安装依赖。

它会根据 package.json 和锁文件解析依赖，必要时更新 package-lock.json。

如果锁文件与依赖声明不一致，可能修改锁文件。

2. npm ci
npm ci

主要用于 CI/CD 环境。

它具有以下特点：

要求存在有效的锁文件。

要求锁文件与 package.json 保持一致。

不会更新锁文件。

安装前会移除已有的 node_modules。

如果锁文件与 package.json 不一致，安装会失败，而不是自动修复锁文件。

这可以帮助团队及时发现没有提交锁文件的情况。

3. pnpm install --frozen-lockfile
pnpm install --frozen-lockfile

要求依赖安装不能修改锁文件。

如果锁文件需要更新，安装会失败。

在 pnpm 的 CI 环境中，检测到锁文件时通常默认启用 frozen-lockfile 行为，但显式指定参数可以让构建意图更加清楚。

注意，pnpm install --frozen-lockfile 与 npm ci 的行为并不完全相同，尤其是对现有 node_modules 的处理。

十一、Monorepo 场景下，为什么经常选择 pnpm？

假设一个电商项目包含：

ecommerce/
│
├── apps/
│   ├── web/          # React 商城
│   ├── admin/        # 后台管理系统
│   └── mobile/       # 移动端
│
├── packages/
│   ├── ui/           # 公共组件
│   ├── utils/        # 工具函数
│   └── types/        # 共享类型
│
├── package.json
└── pnpm-workspace.yaml

三个应用都需要使用公共组件。

如果每个应用都独立管理依赖，可能存在：

相同依赖重复安装。

公共组件需要发布后才能在其他项目中使用。

多个项目的依赖版本不统一。

跨项目修改和联调成本较高。

pnpm Workspaces 可以把这些包放在同一个工作区中管理。

1. 配置工作区

pnpm-workspace.yaml：

packages:
  - 'apps/*'
  - 'packages/*'
2. 声明内部依赖

假设 apps/web/package.json：

{
  "name": "@company/web",
  "dependencies": {
    "@company/ui": "workspace:*"
  }
}

这里的 workspace:* 表示使用当前工作区内的包。

它可以避免在本地开发时意外解析到 npm Registry 上的同名包。

3. 按需执行命令

只构建 Web 项目：

pnpm --filter @company/web build

构建 Web 项目及其工作区依赖：

pnpm --filter '@company/web^...' build
pnpm --filter @company/web build

其中，^... 用于选择目标包的工作区依赖。

注意，实际执行时应结合依赖图和构建工具配置，确保依赖包先于消费它的应用构建。

4. pnpm 和 Turborepo 是什么关系？

这是非常容易混淆的知识点。

pnpm 是包管理工具，Workspaces 负责管理工作区及依赖关系。

Turborepo 是 Monorepo 任务编排与构建工具。

两者解决的问题不同。

pnpm
  ↓
安装依赖
管理 Workspace
链接内部包

Turborepo
  ↓
分析任务依赖
安排构建顺序
并行执行任务
缓存构建结果

例如：

pnpm turbo run build

Turborepo 可以根据任务依赖关系安排多个包的构建，并复用符合条件的缓存结果。

但它本身不是用来替代 pnpm 安装依赖的。

同样，pnpm 也不是实现 Monorepo 的唯一选择，npm Workspaces 和 Yarn Workspaces 都可以完成工作区管理。

十二、25K 面试高频追问
追问 1：pnpm 一定比 npm 快吗？

不一定。

pnpm 的优势主要来自全局 Store 复用、减少重复文件写入，以及依赖安装机制。

但安装速度受以下因素影响：

冷缓存还是热缓存。

网络下载速度。

项目依赖数量。

文件系统是否支持硬链接。

是否存在大量需要执行安装脚本的原生模块。

因此，pnpm 通常具有较好的磁盘复用能力，但不能保证所有项目、所有环境下安装速度都最快。

追问 2：pnpm 能彻底解决幽灵依赖吗？

不能保证彻底解决。

pnpm 默认会限制项目访问未声明的传递依赖，但如果配置了依赖提升，例如：

shamefully-hoist=true

就可能让更多依赖暴露在顶层 node_modules，重新引入幽灵依赖风险。

另外，项目仍然可能存在错误的依赖声明。

因此，pnpm 的依赖隔离是帮助发现问题的机制，不能替代正确的依赖管理。

追问 3：pnpm 的硬链接会不会导致修改一个项目影响另一个项目？

如果多个路径通过硬链接指向同一个文件，直接原地修改文件内容，理论上会影响其他链接。

但 pnpm 的 Store 设计是为了复用不可随意修改的依赖内容，正常开发不应该直接修改 node_modules 中的第三方包。

如果需要修改第三方依赖，应使用正式的补丁机制，例如：

pnpm patch lodash@4.17.21

完成修改后，通过：

pnpm patch-commit <临时修改目录>

生成并记录补丁。

这样修改可以被版本管理，而不是依赖某个开发者本地 node_modules 中的临时改动。

追问 4：为什么有些老项目迁移 pnpm 后会报错？

常见原因包括：

项目使用了未声明的幽灵依赖。

构建工具假设所有依赖都位于顶层 node_modules。

某些插件直接扫描依赖目录，没有正确处理符号链接。

项目存在多个版本的依赖，迁移后暴露出版本冲突。

旧工具链与当前 Node.js 或 pnpm 版本不兼容。

迁移时应先定位具体原因，而不是直接开启 shamefully-hoist。

如果是幽灵依赖，应补充正确的依赖声明。

如果是旧工具的模块解析问题，可以先升级工具，再考虑针对性配置提升规则。

追问 5：dependencies 和 devDependencies 有什么区别？

dependencies 表示应用运行时需要的依赖。

例如：

{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.7.0"
  }
}

devDependencies 表示开发、测试或构建阶段需要的依赖。

例如：

{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "eslint": "^9.0.0"
  }
}

但需要注意：

对于前端项目，React 等运行时依赖通常会被打包进产物，不代表生产服务器必须保留完整的 node_modules。

而对于 Node.js 服务，生产运行时需要的包通常必须安装或被包含在部署产物中。

因此，依赖分类需要结合项目的构建和部署方式理解。

追问 6：peerDependencies 是什么？

peerDependencies 用于声明当前包希望由使用者提供的依赖，以及它兼容的版本范围。

例如开发一个 React 组件库：

{
  "name": "@company/ui",
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}

这样可以表达组件库与宿主 React 版本的兼容关系，避免把 React 当成普通内部依赖而意外引入多份实例。

多份 React 实例可能导致 Hooks 等运行时问题。

不过，peerDependencies 不是保证依赖只有一份的绝对机制，实际还需要结合包管理工具的解析结果、打包配置和运行环境检查。

十三、实际项目怎么选？

| 项目场景 | 选型时重点考虑 |
|----------|----------------|
| 已有 npm 项目 | 优先保持现有工具链稳定 |
| 已有 Yarn 项目 | 确认 Yarn 版本及安装模式 |
| 新建中大型 Monorepo | 可优先评估 pnpm |
| 大量项目复用相同依赖 | pnpm 的 Store 机制有优势 |
| 需要严格依赖管理 | pnpm 默认布局或 Yarn PnP |
| 旧工具兼容性要求高 | 评估传统 node_modules 方案 |
| CI/CD 环境 | 固定工具版本并使用锁文件 |


如果是我负责一个新的 React + NestJS Monorepo，我会考虑使用 pnpm Workspaces 管理依赖，再根据构建规模决定是否引入 Turborepo。

但如果接手的是成熟的 npm 项目，我不会仅仅因为 pnpm 更流行就推动迁移。

我会先评估安装耗时、磁盘占用、幽灵依赖、CI 稳定性以及迁移成本，再决定是否值得调整。

十四、最终背诵版（40 秒）

npm、Yarn 和 pnpm 都是 JavaScript 包管理工具，核心区别在于依赖存储方式、安装结构和依赖隔离机制。

npm 和 Yarn Classic 主要采用扁平化的 node_modules 结构，减少重复依赖，但可能出现幽灵依赖问题。

pnpm 采用内容可寻址存储，通过硬链接等机制复用包文件，再利用符号链接组织依赖关系，因此通常具有较好的磁盘复用能力，并且默认能减少幽灵依赖问题。

Yarn Modern 还提供 PnP 模式，可以不使用传统的 node_modules，但需要考虑工具链兼容性。

三个工具都支持 Workspaces。对于新建的中大型 Monorepo，我会优先评估 pnpm；对于已有项目，则会综合考虑现有工具链、迁移成本和 CI 稳定性。

