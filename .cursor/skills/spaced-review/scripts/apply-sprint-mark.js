#!/usr/bin/env node
/**
 * 读取 冲刺.md，将清单内对应题目在 25k考察列表 标记为 ✗（未学会）
 * 仅匹配清单条目 + 分类段（Vue25/CSS20/浏览器网络20），不做模糊扩散
 */
const fs = require('fs');
const path = require('path');
const { normalizeTitle } = require('./question-utils');
const {
  loadData,
  saveData,
  syncMarkdownTable,
  emptyReviews,
  PROJECT_ROOT,
  todayStr,
} = require('./lib');

const SPRINT_MD = path.join(PROJECT_ROOT, '冲刺.md');

/** 25k 已达标，保持 ✓ */
const KEEP_PASS_IDS = new Set([
  'interview/对比题/vite对比webpack.md',
  'interview/对比题/esModules和commonjs区别.md',
]);

/** 冲刺.md 条目 → 考察列表 path 正则（或精确标题） */
const TOPIC_RULES = [
  { keys: ['eventemitter'], paths: [/interview\/handwritten\/eventEmitter\.md$/i] },
  { keys: ['deepclone'], paths: [/interview\/handwritten\/深拷贝\.md$/i] },
  { keys: ['什么是闭包', '闭包'], paths: [/interview\/es5\/必包\.md$/i] },
  {
    keys: ['eventloop', '跟node的区别', '微任务'],
    paths: [
      /interview\/浏览器\/eventloop\.md$/i,
      /interview\/node\/node中的eventloop\.md$/i,
    ],
  },
  {
    keys: ['useeffect', 'uselayouteffect'],
    paths: [/interview\/对比题\/useEffect和useLayoutEffect\.md$/i],
  },
  {
    keys: ['vue3编译优化'],
    paths: [/interview\/vue3\/vue3做了什么编译优化\.md$/i],
  },
  {
    keys: ['vue2和vue3的区别', 'vue2和vue3'],
    paths: [/interview\/对比题\/vue2和vue3的区别\.md$/i],
  },
  {
    keys: ['vue响应式原理', 'vue原理'],
    paths: [
      /interview\/vue\/Vue 2 响应式原理\.md$/i,
      /interview\/vue\/vue更新机制\.md$/i,
      /interview\/vue\/nexttick源码\.md$/i,
      /interview\/vue\/生命周期\.md$/i,
    ],
  },
  { keys: ['nexttick原理', 'nexttick'], paths: [/interview\/vue\/nexttick源码\.md$/i] },
  {
    keys: ['ci/cd', 'cicd', '埋点', '监控'],
    titles: ['CI/CD', '前端监控', '应用埋点如何检测 pushState；'],
  },
  {
    keys: ['首屏优化', 'fcp'],
    paths: [/interview\/浏览器\/性能指标咋计算\.md$/i],
    titles: ['如何首屏优化', '性能优化', '前端性能优化'],
  },
  {
    keys: ['dayjs', 'moment'],
    paths: [/interview\/对比题\/dayjs和moment区别\.md$/i],
  },
  { keys: ['中间件'], paths: [/interview\/node\/什么是中间件\.md$/i] },
  { keys: ['洋葱'], paths: [/interview\/node\/什么是洋葱模型\.md$/i] },
  { keys: ['iframe', '微前端'], paths: [/interview\/微前端\/为什么不用iframe\.md$/i] },
  {
    keys: ['watch', 'computed'],
    paths: [/interview\/对比题\/computed对比watch\.md$/i],
  },
  {
    keys: ['webpack的热更新', '热更新原理', 'hmr'],
    paths: [
      /interview\/webpack\/HMR原理\.md$/i,
      /interview\/vite\/HMR\.md$/i,
    ],
  },
  {
    keys: ['webpack跟vite', 'webpack和vite', 'vite对比webpack'],
    paths: [/interview\/对比题\/vite对比webpack\.md$/i],
  },
  {
    keys: ['webpack原理'],
    paths: [/interview\/webpack\//i],
    titles: ['webpack原理'],
  },
  {
    keys: ['vite预编译', '预编译'],
    paths: [/interview\/vite\//i],
  },
  {
    keys: ['url输入过程', 'url输入'],
    paths: [/interview\/网络\/url过程\/url输入到页面展示的过程\.md$/i],
  },
  { keys: ['dns'], paths: [/interview\/网络\/url过程\/dns查询过程\.md$/i] },
  {
    keys: ['tls', '握手'],
    paths: [/interview\/网络\/https加密过程\.md$/i],
    titles: ['https加密过程'],
  },
  {
    keys: ['defer', 'async'],
    paths: [/interview\/js\/async跟await\.md$/i],
  },
  {
    keys: ['协商缓存', '强缓存', '缓存'],
    paths: [/interview\/网络\/终于弄懂强缓存和协商缓存了！\.md$/i],
  },
];

const CATEGORY_SECTION_RE = /^##\s*(.+?)(\d+)\s*道?\s*$/;

function normKey(text) {
  return normalizeTitle(text).toLowerCase().replace(/\s+/g, '');
}

function parseSprintMd(content) {
  const topics = [];
  const categoryBuckets = new Set();

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const sectionMatch = trimmed.match(CATEGORY_SECTION_RE);
    if (sectionMatch) {
      const label = sectionMatch[1].trim().toLowerCase();
      if (label.includes('vue')) {
        categoryBuckets.add('vue');
        categoryBuckets.add('vue3');
      }
      if (label.includes('css')) categoryBuckets.add('css');
      if (label.includes('浏览器')) categoryBuckets.add('浏览器');
      if (label.includes('网络')) categoryBuckets.add('网络');
      continue;
    }

    const itemMatch = trimmed.match(/^(?:\d+(?:\.\d+)?[\.．、]\s*)(.+)$/);
    if (itemMatch) topics.push(itemMatch[1].trim());
  }

  return { topics, categoryBuckets: [...categoryBuckets] };
}

function topicLineToKeys(line) {
  const k = normKey(line);
  const keys = [k];
  for (const rule of TOPIC_RULES) {
    if (rule.keys.some((rk) => k.includes(normKey(rk)) || normKey(rk).includes(k))) {
      keys.push(...rule.keys.map(normKey));
    }
  }
  return keys;
}

function questionMatchesRule(q, rule) {
  const p = q.path || '';
  const title = q.title || '';
  if (rule.paths?.some((re) => re.test(p))) return true;
  if (rule.titles?.some((t) => title === t || title.includes(t))) return true;
  return false;
}

function questionMatchesTopicLine(q, line) {
  const p = q.path || '';
  const keys = topicLineToKeys(line);
  for (const rule of TOPIC_RULES) {
    if (!rule.keys.some((rk) => keys.includes(normKey(rk)))) continue;
    if (questionMatchesRule(q, rule)) return true;
  }
  const lineKey = normKey(line);
  const titleKey = normKey(q.title);
  if (lineKey.length >= 4 && (titleKey === lineKey || titleKey.includes(lineKey))) return true;
  if (p.endsWith('.md') && normKey(path.basename(p, '.md')) === lineKey) return true;
  return false;
}

function markNotLearned(q) {
  q.learned = 'no';
  q.firstLearnedAt = null;
  q.reviews = emptyReviews();
  delete q.sprintAt;
}

function resetExceptPass(data) {
  for (const q of data.questions) {
    if (KEEP_PASS_IDS.has(q.id) || KEEP_PASS_IDS.has(q.path)) {
      q.learned = 'yes';
      continue;
    }
    q.learned = null;
    q.firstLearnedAt = null;
    q.reviews = emptyReviews();
    delete q.sprintAt;
  }
}

function applySprintMarks(data, sprintPath = SPRINT_MD) {
  if (!fs.existsSync(sprintPath)) {
    throw new Error(`找不到冲刺文件: ${sprintPath}`);
  }

  resetExceptPass(data);

  const content = fs.readFileSync(sprintPath, 'utf8');
  const { topics, categoryBuckets } = parseSprintMd(content);
  const matchedIds = new Set();
  const matchedTitles = [];

  for (const q of data.questions) {
    if (KEEP_PASS_IDS.has(q.id) || KEEP_PASS_IDS.has(q.path)) continue;

    if (categoryBuckets.includes(q.category) && q.source === 'interview') {
      matchedIds.add(q.id);
      matchedTitles.push(q.title);
      continue;
    }

    if (topics.some((line) => questionMatchesTopicLine(q, line))) {
      matchedIds.add(q.id);
      matchedTitles.push(q.title);
    }
  }

  for (const q of data.questions) {
    if (!matchedIds.has(q.id)) continue;
    markNotLearned(q);
  }

  data.updatedAt = todayStr();
  return { topics, categoryBuckets, matchedIds, matchedTitles };
}

function main() {
  let data = loadData();
  if (!data) throw new Error('请先运行 init-questions.js');

  const result = applySprintMarks(data);
  syncMarkdownTable(data);
  saveData(data);

  const yes = data.questions.filter((q) => q.learned === 'yes').length;
  const no = data.questions.filter((q) => q.learned === 'no').length;

  console.log(JSON.stringify({
    ok: true,
    sprintFile: '冲刺.md',
    categoryBuckets: result.categoryBuckets,
    topicLines: result.topics.length,
    markedCount: result.matchedIds.size,
    keptPass: [...KEEP_PASS_IDS],
    totals: { yes, no, blank: data.questions.length - yes - no },
    markedTitles: [...new Set(result.matchedTitles)].sort((a, b) => a.localeCompare(b, 'zh-CN')),
  }, null, 2));
}

if (require.main === module) main();

module.exports = { applySprintMarks, parseSprintMd };
