---
name: company-drill
description: >-
  按目标公司或 JD 做无限补差特训：定档后搜面经，对照弱项按优先级一直出题，不限题库、不限题量，不走 25/25/50 混抽。
  答完对照 25k 考察列表：过关且能对上则打 ✓；不过关必须把题目或追问写入列表（没有就新建笔记并入表）。
  默认一面且必须穿插手写；用户说二面再切。
  当用户说特训、公司特训、针对xx准备、冲刺xx、给了JD、面经特训、明天面xx 时使用。
---

# 公司 / JD 特训（无限补差）

候选人：**兰为鹏 · 上海 · 6 年前端 · 25k**。出题**不看考察列表有没有**。答完再对照列表：不过关的题目或追问必须写进 `25k考察列表`。

## 硬规则

- **不限题量、不限题库。** 没有「本场 13 题」。
- **不理** 25/25/50 混抽。优先级 = 公司/JD 命中 × 弱项缺口 × 时间性价比。
- 用户没说几面 → **默认一面**，且必须穿插手写。
- 说了「二面 / 三面」才切轮次，见 [company-tiers.md](company-tiers.md)。

## 答完写入考察列表（每次必做）

打分后跑：

```bash
node .cursor/skills/company-drill/scripts/record-result.js --title="题干" --score=<0-10> --domain=react [--id=已有id] [--ask=完整问法] [--failed-followups=追问1,追问2]
```

| 回答 | 考察列表 | 动作 |
|------|----------|------|
| 过关 | 有对应母题 | 打 ✓，写首次学会 / R |
| 过关 | 没有 | 不写入 |
| **不过关** | 有对应母题 | 打 ✗，清空日期；没过的追问写进该母题 md |
| **不过关** | 没有 | 新建 `interview/{方向}/题名.md`，写入 JSON 和 `25k考察列表.md`，打 ✗ |
| 母题过关、追问没过 | 有母题 | 母题保持 ✓；追问追加到母题 md |

`--id` 能对上就带上。对不上不要编 id，让脚本建新题。

只改特训和考察列表，**不要改一面模拟 skill**。一面本来就抽这张表（含 ✗ / 未测）。

## 启动

```bash
node .cursor/skills/company-drill/scripts/analyze-gaps.js --boost=vue,react,performance,ts,engineering,handwritten
node .cursor/skills/company-drill/scripts/match-topics.js --topics=xss,typescript,fiber
node .cursor/skills/company-drill/scripts/session.js --start --company=知乎 --tier=content --round=一面 --jd=Vue,TS,XSS
```

`--boost` 按该公司/JD。档位见 [company-tiers.md](company-tiers.md)。有公司名就搜面经；只给 JD 用薪资+年限+栈定档。

## 组队列

题库没有（如 Taro/UniApp）**照样出**。本地笔记只当判分参考，先不要念答案。

开场只说：哪家/JD、几面、今晚补哪几**块**、跳过什么。立刻第 1 题。不要把后续题干抛给候选人。

## 一题一题

1. 出当前最高优先级 1 题。口述 1～2 个追问；手写给签名+样例。
2. 打分。P0/P1 ≥ **6**，P2/P3 ≥ **5**；手写没写出能跑的代码 → ≤4。
3. 立刻 `record-result.js`。告知是否已写入考察列表。
4. **不要停。** 用户说「够了 / 停」才收。

一面节奏：**每 3～4 道口述插 1 道手写**。

## 禁止

- ❌ 因为考察列表没有就不出题
- ❌ 不过关却不写入 25k 考察列表
- ❌ 过关且列表没有时硬塞进表
- ❌ 用 25/25/50 混抽出题
- ❌ 去改一面模拟 / 自我考察 skill
- ❌ 默认一面却不出代码题
- ❌ 一次把后续题干都抛出来
- ❌ 未达标打 ✓；不带分数打钩
