# Skill 说明

本仓库的 Cursor Agent Skills 都在 `.cursor/skills/`。对话里说到对应触发词时，Agent 会按该 skill 的流程出题 / 辅导 / 写回考察表。

| Skill | 用处 | 触发提示词 | 对应目录 |
|-------|------|------------|----------|
| mock-interview | 一面模拟整场：13 母题（10 八股覆盖工程化/Vue/React/Node/网络/TS/原理/微前端 + 1 阅读 + 2 手写），含追问纠正打分。抽题 80% 已通过 ✓ · 20% 未通过 ✗。需要自己在data/25k考察列表.md重置勾选，在本地进行使用 | 模拟面试、一面模拟、面试考我、mock interview | `.cursor/skills/mock-interview/`（八股来自 `25k考察列表`，阅读 `interview/阅读代码题/`，手写 `interview/handwritten/`） |
| second-round | 二面模拟：默认一场 = 项目深挖 + 1 道 JS 手写 + 1 道中等算法。技术总监/P7/P8 视角连环追问并打分。达标打 ✓，未达标打 ✗。 | 二面、二面模拟、项目深挖、二面面试、second round | `.cursor/skills/second-round/`（材料 `二面面试题/`） |
| spaced-review | 基于遗忘曲线的面试题自我考察。抽题三类混抽：到期 25% · ✗ 未学会 25% · 未测 50%。达标打 ✓，未达标打 ✗。 | 自我考察、随机提问、复习面试题 | `.cursor/skills/spaced-review/`（读取并写回 `data/25k考察列表.json`） |
| tutor-one | 辅导一道题：用户自己出题、自己先回答；按 25k 一面追问到能口述过关。说得不到位就讲细，直到能开口。辅导过程不写入 25k 考察列表。 | 辅导、辅导一道、教会我、这题辅导、我出题、讲会、帮我搞懂 | `.cursor/skills/tutor-one/`（备课可读 `interview/`） |
| deep-tutor | 整块陌生知识点由浅入深辅导：最简要点 → 详细步骤一块一块确认 → 先追问后讲解。用户表示理解才进入下一步。不写入 25k 考察列表。「讲解」走本 skill，「辅导」走 tutor-one。 | 讲解xxx题、讲解 | `.cursor/skills/deep-tutor/`（备课可读 `interview/`） |
| leetcode-hot100 | LeetCode 热题 100 遗忘曲线。每次只发题名和力扣链接，用户自己去平台做。通过 / 没通过 / 不再提问 会更新独立进度表，不写 25k 考察列表。 | 热题100、力扣抽查、抽一道热题、leetcode热题、hot 100、已经通过、没通过 | `.cursor/skills/leetcode-hot100/`（进度表 `data/leetcode热题100.md` / `data/leetcode热题100.json`） |
| algorithm-quiz | 抽查一道 `interview/algorithm` 手写算法题，必须写 JS。题是什么算法就按什么写（DP 题必须 DP）。不写 25k 考察表。 | 算法抽查、算法模拟、抽一道算法、算法面试考我、algorithm quiz | `.cursor/skills/algorithm-quiz/`（题库 `interview/algorithm/`） |
| agent-quiz | 每天自测 Agent 面试题 3 道（原理 / LangChain / Python 尽量各 1）。只出 Python、LangChain、Agent/RAG 理解题，禁止 LangGraph。达标打 ✓，未达标打 ✗。 | Agent自测、agent面试、langchain抽查、每天agent、agent 3题、agent 面试考我 | `.cursor/skills/agent-quiz/`（题库 `interview/agent/`，写回 `25k考察列表`） |
| company-drill | 按目标公司或 JD 无限补差特训：搜面经、对照弱项一直出题，不走 25/25/50 混抽。默认一面且必须穿插手写；说二面再切。不过关必须写入考察列表。 | 特训、公司特训、针对xx准备、冲刺xx、给了JD、面经特训、明天面xx | `.cursor/skills/company-drill/`（写回 `25k考察列表`，笔记 `interview/`） |