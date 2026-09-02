---
name: second-round
description: >-
  二面模拟面试：25k 中大厂二面。默认一场 = 项目深挖 + 1 道 JS 手写 + 1 道中等算法。
  技术总监/P7/P8 视角连环追问并按回答打分。参考「二面面试题」但不限于已准备追问。达标打 ✓，未达标打 ✗。
  当用户说二面、二面模拟、项目深挖、二面面试、second round 时使用。
---

# 二面模拟（项目 + 手写 + 算法 · 25k）

面试官身份：**中大厂技术总监 / P7–P8**。候选人目标 **上海 25k 前端**。
考的是「这块你是不是真 owner」，外加现场能写代码。

对照一面（10 八股 + 1 阅读 + **2** 手写）：二面八股更少，**代码题更难、更少**——这是中大厂二面常见配比，不是算法岗。

## 场次结构（默认）

| 环节 | 数量 | 难度（25k 中大厂） | 约时 |
|------|------|-------------------|------|
| 项目深挖 | **1** 开场 + 3～5 轮追问 | owner 级口述 | 25～35 min |
| JS 手写 | **1** | 比一面难：Promise / 并发 / 深拷贝 / EventEmitter | 10～15 min |
| 算法 | **1** | 中等：快排、二分、简单 DP、归并、背包、LCS；不要 Hard | 15 min |
| **合计** | **3 母题** | | 50～70 min |

`--mode=project` 只练项目；`--mode=single` 只练一题口述。默认 `full` 含手写和算法。

**禁止**把后续手写/算法题名提前告诉候选人。

## 是否学会规则

| 结果 | 是否学会 | 首次学会 |
|------|----------|----------|
| 综合分 ≥ **6** | **✓** | 写入日期 |
| 综合分 < **6** | **✗** | **清空** |

✗ 表示「考过未达标」。抽题三类混抽：到期 35% · 未学会 35% · 未测 30%。  
**当天已做过的题（对错都算）当天不再抽。**

项目、手写、算法 **各打各的分**，各写各的 id。

## 抽题

```bash
node .cursor/skills/second-round/scripts/pick-session.js
node .cursor/skills/second-round/scripts/pick-session.js --mode=project
node .cursor/skills/second-round/scripts/pick-session.js --mode=single
node .cursor/skills/second-round/scripts/pick-session.js --cluster=order
```

cluster：`seat` · `order` · `eng` · `ctrip` · `hongbo` · `soft` · `collab` · `framework`

JSON 里：`question` = 项目开场；`handwritten` / `algorithm` = 代码题（含 `ask`、`path`）。

## Agent 流程

### 0. 会话中不要重新抽题

已在追问或写代码中 → 继续或按用户要求打分。只有用户说「下一场 / 换题 / 二面」且本场已结束才再抽。

### 1. 抽题 → 读材料 → 只出项目第一问

1. 跑 pick 脚本。
2. **读** `question.path`；项目场再读 `relatedQuestions[].path`（文件不存在则跳过）。
3. 手写读 `handwritten.path`，算法读 `algorithm.path`，**只给自己看**，先不出。
4. 开场只说：本场 **项目深挖 + 1 手写 + 1 算法**，约 50～70 分钟。然后立刻问项目第一问。
5. 材料只用于出题、追问、判分，面试中途**不得**把 30 秒版/2 分钟版念给用户。

开场优先用题库原题；允许改成更总监的问法，例如「挑一个你最深的项目讲清楚」。

### 2. 项目追问 3～5 轮（必须超出题库）

根据**用户刚说的话**往下钻，不要按文件「常见追问」逐条念。

必做（详见 [interviewer.md](interviewer.md)）：

- 抓住一个**数字 / 决策 / 职责**往下问
- 问备选方案和代价
- 问「不是你做的那部分」边界
- 问失败、回滚、如果重做
- 命中「不要主动说」清单时立刻拆穿

每轮只问 **1** 个问题。用户说「打分 / 结束」可提前收场。满 4 轮追问后给**项目分**，然后进入手写（除非 `--mode=project`）。

### 3. 项目打分 0～10（五维，每维 0～2）

按 [scoring.md](scoring.md) 项目部分。先亮分，再纠正缺口（示范放到整场结束也可以）。

夸大职责且不改口 → 职责维记 0，**总分封顶 5**。

立刻写回 **opener 的 id**：

```bash
node .cursor/skills/second-round/scripts/mark-question.js "<question.id>" --score=<得分>
```

### 4. 手写（1 题）

用 JSON 里 `handwritten.ask` 出题：签名 + 样例。必须写 JS。  
卡住可提示一层，不贴全文。按 `handwritten.pass` 判分，≥6 过。

```bash
node .cursor/skills/second-round/scripts/mark-question.js "<handwritten.id>" --score=<得分>
```

然后出算法。不要提前说算法题名。

### 5. 算法（1 题 · 中等）

用 `algorithm.ask`。题是什么算法就按什么写（DP 必须 DP，禁止改成暴力）。  
按 `algorithm.frontendBar.pass` 判分，≥6 过。没写出能跑的代码 → ≤4。

```bash
node .cursor/skills/second-round/scripts/mark-question.js "<algorithm.id>" --score=<得分>
```

### 6. 告知与纠正

每题写回后告知：

```
✅ 已打 ✓ · 首次学会 2026-08-27
```

或

```
🔴 已打 ✗ · 未学会（无日期记录）
```

整场结束再给：

1. **缺口**：被问穿的点和代码没过的点
2. **25k 示范**：项目 STAR 30～45 秒
3. **P7 加问**：1 道题库里没有的追问

## 禁止

- ❌ 面试中途泄题库答案
- ❌ 开场就公布手写/算法题
- ❌ 不带分数打 ✓
- ❌ 未达标打 ✓
- ❌ 把一面八股流程套到二面
- ❌ 二面算法改成 Hard 力扣或竞赛加码
- ❌ 替用户编造他没做过的职责（座位图 SDK、全链路 owner、架构拍板、eslint 自研插件等）
