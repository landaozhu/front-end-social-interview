const fs = require('fs');
const path = require('path');
const spaced = require('../../spaced-review/scripts/lib');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const CATALOG_FILE = path.join(__dirname, '../catalog.json');
const DATA_FILE = path.join(PROJECT_ROOT, 'leetcode热题100.json');
const TABLE_MD = path.join(PROJECT_ROOT, 'leetcode热题100.md');
const LC_BASE = 'https://leetcode.cn/problems';

const DIFFICULTY_LABEL = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };

const METHOD_BY_TOPIC = {
  哈希: 'hash',
  双指针: 'two-pointers',
  滑动窗口: 'sliding-window',
  子串: 'sliding-window',
  普通数组: 'array',
  矩阵: 'matrix',
  链表: 'linked-list',
  二叉树: 'tree',
  图论: 'graph',
  回溯: 'backtrack',
  二分查找: 'binary-search',
  栈: 'stack',
  堆: 'heap',
  贪心算法: 'greedy',
  动态规划: 'dp',
  多维动态规划: 'dp',
  技巧: 'trick',
};

/** 已通过、当前只反复考这些；其余未测先不抽 */
const INITIAL_PASSED_TITLES = new Set([
  '两数之和',
  '字母异位词分组',
  '移动零',
  '盛最多水的容器',
  '找到字符串中所有字母异位词',
  '合并区间',
  '轮转数组',
  '矩阵置零',
  '螺旋矩阵',
  '相交链表',
  '环形链表 II',
  '买卖股票的最佳时机',
  '打家劫舍',
  '颜色分类',
  '只出现一次的数字',
  '多数元素',
  '爬楼梯',
  '杨辉三角',
  '有效的括号',
  '最小栈',
  '搜索插入位置',
  '括号生成',
  '电话号码的字母组合',
  '岛屿数量',
  '腐烂的橘子',
  '二叉树的层序遍历',
  '将有序数组转换为二叉搜索树',
  '二叉树的中序遍历',
  '二叉树的最大深度',
  '翻转二叉树',
  '对称二叉树',
  '合并两个有序链表',
  '两数相加',
  '反转链表',
  '回文链表',
  '环形链表',
  '最大子数组和',
  '无重复字符的最长子串',
  '接雨水',
]);

/** 已通过批次的首次学会：7 月底过完一轮，不是建表当天 */
const INITIAL_LEARNED_AT = '2026-07-31';
const SEEDED_TODAY_BY_MISTAKE = '2026-08-29';

/** 遗忘加练优先；其余到期复习。没过 ≠ 没学过，不进 ✗ 池 */
const PICK_RATIOS_UNLOCKED = { forgotten: 0.6, due: 0.4, notLearned: 0, untested: 0 };

function importanceFromDifficulty(difficulty) {
  return difficulty === 'HARD' ? 'P1' : 'P0';
}

function importanceLabel(importance) {
  return importance === 'P0' ? 'P0 必考' : 'P1 高频';
}

function questionId(item) {
  return `leetcode/${item.fid}-${item.slug}`;
}

function loadCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return spaced.sanitizeData(data);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/^\d+\s*[\.、．]\s*/, '')
    .replace(/\s+/g, '')
    .replace(/[：:()（）]/g, '');
}

function findQuestion(data, query) {
  if (!query) {
    if (data.lastPickedId) {
      return data.questions.find((q) => q.id === data.lastPickedId) || null;
    }
    return null;
  }

  const raw = String(query).trim();
  const n = normalizeTitle(raw);

  const exact = data.questions.find((q) => (
    q.title === raw
    || q.displayTitle === raw
    || q.slug === raw
    || String(q.fid) === raw
    || q.id === raw
  ));
  if (exact) return exact;

  const exactNorm = data.questions.find((q) => (
    normalizeTitle(q.title) === n
    || normalizeTitle(q.displayTitle) === n
  ));
  if (exactNorm) return exactNorm;

  const hits = data.questions.filter((q) => {
    const t = normalizeTitle(q.title);
    return t.includes(n) || n.includes(t);
  });
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) {
    hits.sort((a, b) => a.title.length - b.title.length);
    return hits[0];
  }
  return null;
}

function markPlatformPass(data, query, date = spaced.todayStr()) {
  const q = findQuestion(data, query);
  if (!q) throw new Error(`找不到题目: ${query || '(上次抽到的题)'}`);

  q.unlocked = true;
  q.learned = 'yes';
  if (!q.firstLearnedAt) q.firstLearnedAt = date;
  q.lastAttemptedAt = date;
  delete q.forgottenAt;
  delete q.lapseCount;
  delete q.sprintAt;
  const stageId = spaced.getCurrentStage(q);
  if (stageId) q.reviews[stageId] = date;
  data.updatedAt = date;
  saveData(data);
  return {
    question: q,
    passed: true,
    learned: 'yes',
    stageId: stageId || null,
    nextStage: spaced.getCurrentStage(q),
    date,
  };
}

function markPlatformFail(data, query, date = spaced.todayStr()) {
  const q = findQuestion(data, query);
  if (!q) throw new Error(`找不到题目: ${query || '(上次抽到的题)'}`);

  q.unlocked = true;
  q.learned = 'yes';
  if (!q.firstLearnedAt || q.firstLearnedAt === SEEDED_TODAY_BY_MISTAKE) {
    q.firstLearnedAt = INITIAL_PASSED_TITLES.has(q.title) ? INITIAL_LEARNED_AT : date;
  }
  q.forgottenAt = date;
  q.lapseCount = (q.lapseCount || 0) + 1;
  q.lastAttemptedAt = date;
  q.reviews = spaced.emptyReviews();
  delete q.sprintAt;
  data.updatedAt = date;
  saveData(data);
  return {
    question: q,
    passed: false,
    learned: 'yes',
    forgotten: true,
    lapseCount: q.lapseCount,
    date,
  };
}

function markPlatformRetire(data, query, date = spaced.todayStr()) {
  const q = findQuestion(data, query);
  if (!q) throw new Error(`找不到题目: ${query || '(上次抽到的题)'}`);
  q.retired = true;
  q.retiredAt = date;
  data.updatedAt = date;
  saveData(data);
  return { question: q, retired: true, date };
}

function rememberPicked(data, questionIdValue) {
  data.lastPickedId = questionIdValue;
  saveData(data);
}

function seedPassedPendingR0(q, date) {
  q.learned = 'yes';
  q.firstLearnedAt = date;
  q.reviews = spaced.emptyReviews();
  delete q.sprintAt;
  delete q.forgottenAt;
  delete q.lapseCount;
}

function applyInitialPassedHistory(q, prev, today) {
  q.unlocked = true;
  q.learned = 'yes';
  if (!q.firstLearnedAt || q.firstLearnedAt === SEEDED_TODAY_BY_MISTAKE) {
    q.firstLearnedAt = INITIAL_LEARNED_AT;
  }
  if (prev?.forgottenAt || prev?.learned === 'no') {
    q.forgottenAt = prev?.forgottenAt || today;
    q.lapseCount = prev?.lapseCount || 1;
  }
}

function buildQuestion(item, index, prev, today) {
  const importance = prev?.importanceLocked && prev?.importance
    ? prev.importance
    : importanceFromDifficulty(item.difficulty);

  const unlocked = Boolean(prev?.unlocked) || INITIAL_PASSED_TITLES.has(item.title);

  const q = {
    id: questionId(item),
    fid: item.fid,
    slug: item.slug,
    title: item.title,
    titleEn: item.titleEn,
    displayTitle: `${item.fid}. ${item.title}`,
    category: item.topic,
    source: item.topic,
    path: `${LC_BASE}/${item.slug}/`,
    difficulty: item.difficulty,
    difficultyLabel: DIFFICULTY_LABEL[item.difficulty] || item.difficulty,
    method: METHOD_BY_TOPIC[item.topic] || 'array',
    learned: prev?.learned ?? null,
    firstLearnedAt: prev?.firstLearnedAt ?? null,
    reviews: prev?.reviews ?? spaced.emptyReviews(),
    order: index + 1,
    importance,
    importanceLabel: importanceLabel(importance),
    importanceLocked: prev?.importanceLocked ?? false,
    unlocked,
  };

  if (prev?.forgottenAt) q.forgottenAt = prev.forgottenAt;
  if (prev?.lapseCount) q.lapseCount = prev.lapseCount;
  if (prev?.lastAttemptedAt) q.lastAttemptedAt = prev.lastAttemptedAt;
  if (prev?.retired) {
    q.retired = true;
    if (prev.retiredAt) q.retiredAt = prev.retiredAt;
  }

  if (INITIAL_PASSED_TITLES.has(item.title)) {
    applyInitialPassedHistory(q, prev, today);
  } else if (unlocked && prev?.learned !== 'yes' && prev?.learned !== 'no') {
    seedPassedPendingR0(q, today);
  }

  if (!q.lastAttemptedAt && q.forgottenAt) q.lastAttemptedAt = q.forgottenAt;

  spaced.sanitizeQuestionState(q);
  return q;
}

function initOrSyncData() {
  const catalog = loadCatalog();
  const existing = loadData();
  const oldMap = new Map();
  for (const q of existing?.questions || []) {
    oldMap.set(q.id, q);
    if (q.slug) oldMap.set(q.slug, q);
    if (q.title) oldMap.set(q.title, q);
  }

  const today = spaced.todayStr();
  const questions = catalog.map((item, index) => {
    const prev = oldMap.get(questionId(item)) || oldMap.get(item.slug) || oldMap.get(item.title);
    return buildQuestion(item, index, prev, today);
  });

  const catalogTitles = new Set(catalog.map((item) => item.title));
  const unmatched = [...INITIAL_PASSED_TITLES].filter((t) => !catalogTitles.has(t));
  if (unmatched.length) {
    console.error(JSON.stringify({ unmatchedPassedTitles: unmatched }));
  }

  const data = {
    version: 1,
    plan: 'LeetCode 热题 100',
    planUrl: 'https://leetcode.cn/studyplan/top-100-liked/',
    updatedAt: today,
    pickMode: 'unlocked-only',
    lastPickedId: existing?.lastPickedId || null,
    pickRatios: PICK_RATIOS_UNLOCKED,
    passScore25k: spaced.PASS_SCORE_25K,
    reviewStages: spaced.REVIEW_STAGES.map(({ id, label, daysAfterPrev }) => ({
      id, label, daysAfterPrev,
    })),
    questions,
  };

  saveData(data);
  return data;
}

function markResult(data, questionIdValue, score, date = spaced.todayStr()) {
  const q = data.questions.find((x) => x.id === questionIdValue);
  if (!q) throw new Error(`题目不存在: ${questionIdValue}`);

  const threshold = spaced.getPassThreshold(q.importance);
  const passed = spaced.isPass25k(score, q.importance);

  if (passed) {
    q.learned = 'yes';
    if (!q.firstLearnedAt) q.firstLearnedAt = date;
    q.lastAttemptedAt = date;
    delete q.forgottenAt;
    delete q.lapseCount;
    delete q.sprintAt;
    const stageId = spaced.getCurrentStage(q);
    if (stageId) q.reviews[stageId] = date;
    data.updatedAt = date;
    saveData(data);
    return {
      question: q,
      passed: true,
      learned: 'yes',
      score,
      threshold,
      stageId: stageId || null,
      nextStage: spaced.getCurrentStage(q),
      date,
    };
  }

  q.learned = 'yes';
  if (!q.firstLearnedAt || q.firstLearnedAt === SEEDED_TODAY_BY_MISTAKE) {
    q.firstLearnedAt = INITIAL_PASSED_TITLES.has(q.title) ? INITIAL_LEARNED_AT : date;
  }
  q.forgottenAt = date;
  q.lapseCount = (q.lapseCount || 0) + 1;
  q.lastAttemptedAt = date;
  q.reviews = spaced.emptyReviews();
  delete q.sprintAt;
  data.updatedAt = date;
  saveData(data);
  return {
    question: q,
    passed: false,
    learned: 'yes',
    forgotten: true,
    lapseCount: q.lapseCount,
    score,
    threshold,
    date,
  };
}

function toPickItem(q, pickSource, stageLabelOverride) {
  const stageId = spaced.getCurrentStage(q);
  const stage = spaced.REVIEW_STAGES.find((s) => s.id === stageId);
  return {
    question: q,
    stageId,
    stageLabel: stageLabelOverride || (stage ? stage.label : '巩固'),
    dueDate: stageId ? spaced.getStageDueDate(q, stageId) : null,
    overdueDays: 0,
    pickSource,
  };
}

function isForgotten(q) {
  return q.learned === 'yes' && Boolean(q.forgottenAt);
}

function formatLcLearned(q) {
  if (isForgotten(q)) return '✓ 遗忘';
  return spaced.formatLearned(q);
}

function pickFromNamedPools(pools) {
  const available = pools.filter((p) => p.items.length > 0 && p.ratio > 0);
  if (available.length === 0) return { picked: null, pickSource: null };

  const totalRatio = available.reduce((sum, p) => sum + p.ratio, 0);
  let r = Math.random() * totalRatio;
  let chosen = available[0];
  for (const p of available) {
    r -= p.ratio;
    if (r <= 0) {
      chosen = p;
      break;
    }
  }
  return { picked: spaced.pickWeightedFromPool(chosen.items), pickSource: chosen.name };
}

/** 只抽 unlocked：遗忘加练优先，再抽其余到期；未测不考 */
function pickUnlocked(data, today = spaced.todayStr()) {
  const skip = (q) => !spaced.wasAttemptedToday(q, today) && !spaced.isRetired(q);
  const unlocked = data.questions.filter((q) => q.unlocked && skip(q));
  const allDue = spaced.getDueQuestions(data, today)
    .filter((d) => d.question.unlocked && skip(d.question));
  const dueById = new Map(allDue.map((d) => [d.question.id, d]));

  const forgottenQs = unlocked.filter(isForgotten);
  const forgottenIds = new Set(forgottenQs.map((q) => q.id));
  const forgotten = forgottenQs.map((q) => {
    const dueItem = dueById.get(q.id);
    const item = dueItem
      ? { ...dueItem, pickSource: 'forgotten', stageLabel: '遗忘加练' }
      : toPickItem(q, 'forgotten', '遗忘加练');
    item.overdueDays = (item.overdueDays || 0) + 40 * (q.lapseCount || 1);
    return item;
  });

  const due = allDue.filter((d) => !forgottenIds.has(d.question.id));
  const notLearned = [];

  const { picked, pickSource } = pickFromNamedPools([
    { name: 'forgotten', items: forgotten, ratio: PICK_RATIOS_UNLOCKED.forgotten },
    { name: 'due', items: due, ratio: PICK_RATIOS_UNLOCKED.due },
  ]);

  if (picked) {
    return { due: allDue, forgotten, notLearned, untested: [], picked, pickSource };
  }

  const practice = unlocked
    .filter((q) => q.learned === 'yes')
    .map((q) => toPickItem(q, 'learnedPractice', '已通过反复练'));

  return {
    due: allDue,
    forgotten,
    notLearned,
    untested: [],
    picked: practice.length ? spaced.pickWeightedFromPool(practice) : null,
    pickSource: practice.length ? 'learnedPractice' : null,
  };
}

function syncMarkdownTable(data) {
  const stages = data.reviewStages;
  const header = ['#', '题目', '是否学会', '不再提问', '重要程度', '来源', '首次学会', ...stages.map((s) => s.label)];
  const sep = header.map((_, i) => (i < 7 ? '---' : ':---:'));
  const rows = data.questions.map((q) => [
    String(q.order),
    q.displayTitle || q.title,
    formatLcLearned(q),
    q.retired ? '✓' : '',
    q.importanceLabel || q.importance || '',
    q.source,
    q.firstLearnedAt || '',
    ...stages.map((s) => q.reviews[s.id] || ''),
  ]);

  const unlocked = data.questions.filter((q) => q.unlocked);
  const due = spaced.getDueQuestions(data).filter((d) => d.question.unlocked);
  const forgotten = unlocked.filter((q) => isForgotten(q) && !spaced.isRetired(q));
  const forgottenIds = new Set(forgotten.map((q) => q.id));
  const dueOther = due.filter((d) => !forgottenIds.has(d.question.id) && !spaced.isRetired(d.question));
  const locked = data.questions.filter((q) => !q.unlocked);
  const retiredCount = data.questions.filter((q) => spaced.isRetired(q)).length;
  const ratioText = '有遗忘则 60% 抽遗忘加练、40% 抽其余到期；未测先不考。没过保持 ✓，只提高抽中频率。**当天已做过的题（对错都算）当天不再抽**。**不再提问永不抽**（须你主动说才打钩）';
  const dueByStage = {};
  const dueByImportance = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const d of dueOther) {
    dueByStage[d.stageLabel] = (dueByStage[d.stageLabel] || 0) + 1;
    const imp = d.question.importance || 'P2';
    dueByImportance[imp] = (dueByImportance[imp] || 0) + 1;
  }

  const learnedStats = data.questions.reduce(
    (acc, q) => {
      if (isForgotten(q)) acc.forgotten += 1;
      else if (q.learned === 'yes') acc.yes += 1;
      else if (q.learned === 'no') acc.no += 1;
      else acc.blank += 1;
      return acc;
    },
    { yes: 0, no: 0, blank: 0, forgotten: 0 },
  );

  const impCounts = data.questions.reduce((acc, q) => {
    acc[q.importance] = (acc[q.importance] || 0) + 1;
    return acc;
  }, {});

  const byTopic = data.questions.reduce((acc, q) => {
    acc[q.source] = (acc[q.source] || 0) + 1;
    return acc;
  }, {});
  const topicText = Object.entries(byTopic).map(([k, v]) => `${k} ${v}`).join(' · ');

  const md = `# LeetCode 热题 100

> 题单：[LeetCode 热题 100](${data.planUrl}) · **${data.questions.length}** 道  
> 分组：${topicText}  
> 分级：简单/中等 → P0 必考 ${impCounts.P0 || 0} · 困难 → P1 高频 ${impCounts.P1 || 0}  
> 学会状态：✓ 已学会 ${learnedStats.yes} · ✓ 遗忘 ${learnedStats.forgotten} · 未测 ${learnedStats.blank} · 不再提问 ${retiredCount}  
> **抽题范围：仅已通过 ${unlocked.length} 道**（其余 ${locked.length} 道未测先不考）  
> 抽题策略：${ratioText}  
> 数据文件：[\`leetcode热题100.json\`](./leetcode热题100.json)  
> 最后更新：${data.updatedAt}

## 使用方式

1. 说「热题 100」「抽一道热题」→ **每次只出 1 题名 + 力扣链接**，自己去平台做
2. 做完回「通过 / 没通过」，或主动说「xx 已经通过」→ 自动写回遗忘表
3. 抽题：\`node .cursor/skills/leetcode-hot100/scripts/pick-question.js\`
4. 通过：\`node .cursor/skills/leetcode-hot100/scripts/mark-result.js --pass "两数之和"\`
5. 没过：\`node .cursor/skills/leetcode-hot100/scripts/mark-result.js --fail\`
6. 不再提问（须你主动说）：\`node .cursor/skills/leetcode-hot100/scripts/mark-result.js --retire\`

## 是否学会说明

| 标记 | 含义 |
|------|------|
| **✓** | 7 月底已过完；「首次学会」= 锚点日期 |
| **✓ 遗忘** | 学过但这次没写出来；**不打 ✗**；抽题约 60% 会抽这类 |
| **（空）** | 未测；**先不抽**，你自己做完后说「xx 已经通过」即可解锁 |
| **不再提问 ✓** | **只有你主动说**才打钩；打上后永远不再抽。通过/没过都不会自动打 |

没过 = 太久没复习忘了，不是从来没学过。通过后「✓ 遗忘」改回 ✓，恢复正常曲线。**当天做过的题当天不再抽。**

## 遗忘曲线（仅 ✓ / ✓ 遗忘）

**前提**：是否学会含 ✓ 且「首次学会」有日期，才参与复习调度。

| 节点 | 间隔 | 到期日计算 | 列中显示 |
|------|------|------------|----------|
| R0 初识 | 当天 | = 首次学会 | 复习通过日期 |
| R1 复习 | +1 天 | R0 日期 + 1 天 | 复习通过日期 |
| R2 复习 | +2 天 | R1 日期 + 2 天 | 复习通过日期 |
| R3 复习 | +4 天 | R2 日期 + 4 天 | 复习通过日期 |
| R4 复习 | +7 天 | R3 日期 + 7 天 | 复习通过日期 |
| R5 复习 | +15 天 | R4 日期 + 15 天 | 复习通过日期 |
| R6 复习 | +30 天 | R5 日期 + 30 天 | 复习通过日期 |

R 列显示**实际日期**，空白 = 该节点尚未复习通过。

## 今日概览

- **遗忘加练**：${forgotten.length} 道（有则约 60% 抽中）
- **待复习（其余到期）**：${dueOther.length} 道（P0 ${dueByImportance.P0} · P1 ${dueByImportance.P1} · P2 ${dueByImportance.P2} · P3 ${dueByImportance.P3}）
- **未测（空，先不考）**：${locked.length} 道
- **不再提问**：${retiredCount} 道（永不抽）
- **抽题策略**：${ratioText}
${Object.entries(dueByStage).map(([k, v]) => `- ${k} 到期：${v} 道`).join('\n') || '- 暂无其余到期复习'}

## 题目进度表

| ${header.join(' | ')} |
| ${sep.join(' | ')} |
${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}
`;

  fs.writeFileSync(TABLE_MD, md, 'utf8');
}

module.exports = {
  PROJECT_ROOT,
  DATA_FILE,
  TABLE_MD,
  INITIAL_PASSED_TITLES,
  INITIAL_LEARNED_AT,
  loadData,
  saveData,
  initOrSyncData,
  markResult,
  markPlatformPass,
  markPlatformFail,
  markPlatformRetire,
  findQuestion,
  rememberPicked,
  syncMarkdownTable,
  pickUnlocked,
  getStageDueDate: spaced.getStageDueDate,
};
