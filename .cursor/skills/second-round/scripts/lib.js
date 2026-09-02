const fs = require('fs');
const path = require('path');

const algoQuiz = require('../../algorithm-quiz/scripts/lib');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BANK_DIR = path.join(PROJECT_ROOT, '二面面试题');
const PROGRESS_FILE = path.join(__dirname, '..', 'progress.json');
const HANDWRITTEN_DIR = 'interview/handwritten';

const PASS_SCORE = 6;
const DUE_AFTER_DAYS = 7;
const PICK_RATIOS = { due: 0.35, notLearned: 0.35, untested: 0.3 };

const PROFILE = {
  name: '兰为鹏',
  yearsOfExperience: 9,
  level: 'senior',
  targetCity: '上海',
  targetSalaryLabel: '25k',
  interviewRound: '二面',
  interviewer: '技术总监 / P7-P8',
  companyTier: '中大厂（非顶尖）',
};

const CLUSTERS = {
  seat: {
    id: 'seat',
    name: '猫眼选座 / C端',
    opener: '06-选座项目完整介绍',
  },
  order: {
    id: 'order',
    name: '范特西上单 2.0',
    opener: '15-范特西新上单2.0项目介绍',
  },
  eng: {
    id: 'eng',
    name: '工程化 webpack / 灰度 / umi',
    opener: '22-webpack升级2到4',
  },
  ctrip: {
    id: 'ctrip',
    name: '携程酒店地图 / SSR',
    opener: '27-酒店地图页SSR优化',
  },
  hongbo: {
    id: 'hongbo',
    name: '宏波组长 / 全栈',
    opener: '30-前端组长职责与做法',
  },
  soft: {
    id: 'soft',
    name: '综合软实力',
    opener: '01-你的优势是什么',
  },
  collab: {
    id: 'collab',
    name: '协作 / 工程文化',
    opener: '34-CodeReview怎么推动',
  },
  framework: {
    id: 'framework',
    name: '框架深度 / 方案设计',
    opener: '40-你怎么做技术方案设计',
  },
};

const QUESTION_META = {
  '01-你的优势是什么': { cluster: 'soft', importance: 'P0', must: true },
  '02-B端C端双线经验的价值': { cluster: 'soft', importance: 'P0', must: true },
  '03-排期两周压缩到一周怎么办': { cluster: 'soft', importance: 'P0', must: true },
  '04-和产品意见不一致怎么办': { cluster: 'soft', importance: 'P1', must: false },
  '05-线上P0故障怎么处理': { cluster: 'soft', importance: 'P0', must: true },
  '06-选座项目完整介绍': { cluster: 'seat', importance: 'P0', must: true },
  '07-选座页性能优化': { cluster: 'seat', importance: 'P0', must: true },
  '08-日历高度自适应方案': { cluster: 'seat', importance: 'P0', must: true },
  '09-单场次多场次跳转逻辑': { cluster: 'seat', importance: 'P0', must: true },
  '10-售罄延期取消状态处理': { cluster: 'seat', importance: 'P1', must: false },
  '11-固定套票复杂票型': { cluster: 'seat', importance: 'P1', must: false },
  '12-H5和小程序差异': { cluster: 'seat', importance: 'P0', must: true },
  '13-微信小程序登录与unionId': { cluster: 'seat', importance: 'P0', must: true },
  '14-uni-app项目经验': { cluster: 'seat', importance: 'P0', must: true },
  '15-范特西新上单2.0项目介绍': { cluster: 'order', importance: 'P0', must: true },
  '16-为什么选qiankun微前端': { cluster: 'order', importance: 'P0', must: true },
  '17-条件退模块怎么做': { cluster: 'order', importance: 'P0', must: true },
  '18-销售计划模块怎么做': { cluster: 'order', importance: 'P0', must: true },
  '19-蓄水复杂状态切换': { cluster: 'order', importance: 'P0', must: true },
  '20-Vue2升Vue3重构踩坑': { cluster: 'order', importance: 'P0', must: true },
  '21-为什么写Egg中间层': { cluster: 'order', importance: 'P1', must: false },
  '22-webpack升级2到4': { cluster: 'eng', importance: 'P0', must: true },
  '23-灰度发布怎么做': { cluster: 'eng', importance: 'P0', must: true },
  '24-eslint与自研插件': { cluster: 'eng', importance: 'P1', must: false },
  '25-umi升级经验': { cluster: 'eng', importance: 'P1', must: false },
  '26-范特西首屏userMenu预加载': { cluster: 'eng', importance: 'P1', must: false },
  '27-酒店地图页SSR优化': { cluster: 'ctrip', importance: 'P0', must: true },
  '28-Java-BFF中间层开发': { cluster: 'ctrip', importance: 'P1', must: false },
  '29-酒店复访功能': { cluster: 'ctrip', importance: 'P1', must: false },
  '30-前端组长职责与做法': { cluster: 'hongbo', importance: 'P0', must: true },
  '31-需求拆解与任务分配': { cluster: 'hongbo', importance: 'P0', must: true },
  '32-审批组件与回滚方案': { cluster: 'hongbo', importance: 'P1', must: false },
  '33-带新人协作经验': { cluster: 'hongbo', importance: 'P1', must: false },
  '34-CodeReview怎么推动': { cluster: 'collab', importance: 'P0', must: true },
  '35-AI辅助研发怎么用': { cluster: 'collab', importance: 'P1', must: false },
  '36-技术分享做过什么': { cluster: 'collab', importance: 'P1', must: false },
  '37-Vue和React最大挑战': { cluster: 'framework', importance: 'P0', must: true },
  '38-性能优化方法论': { cluster: 'framework', importance: 'P0', must: true },
  '39-微前端踩坑': { cluster: 'order', importance: 'P1', must: false },
  '40-你怎么做技术方案设计': { cluster: 'framework', importance: 'P0', must: true },
  '41-uni-app兼容题-维护向怎么答': { cluster: 'seat', importance: 'P0', must: true },
};

/**
 * 中大厂 25k 前端二面手写：比一面少、比一面难。
 * 一面常见防抖/flatten；二面更常考 Promise、并发、深拷贝、EventEmitter。
 */
const SECOND_ROUND_HANDWRITTEN = [
  {
    file: 'promise.md',
    title: '手写 Promise（then 链）',
    weight: 3,
    ask: '手写简化版 `Promise`：支持 `then` 链式、异步 resolve。不必完整 A+。',
    pass: '能 then 链式拿到值；同步/异步 resolve 都对',
  },
  {
    file: '字节：实现一下并发请求.md',
    title: '控制并发请求',
    weight: 3,
    ask: '手写 `multiRequest(urls, maxNum)`：最多同时 maxNum 个请求，全部完成后 resolve 结果数组（顺序与 urls 一致）。',
    pass: '并发上限正确、结束时结果齐、顺序不错位',
  },
  {
    file: '深拷贝.md',
    title: '深拷贝',
    weight: 3,
    ask: '手写 `cloneDeep(obj)`，要处理循环引用（可用 WeakMap）。',
    pass: '普通对象/数组对；循环引用不爆栈',
  },
  {
    file: 'eventEmitter.md',
    title: 'EventEmitter',
    weight: 3,
    ask: '手写 `EventEmitter`：`on` / `off` / `emit` / `once`。',
    pass: '订阅、触发、取消、once 只触发一次',
  },
  {
    file: 'call、apply、bind.md',
    title: 'call / apply / bind',
    weight: 2,
    ask: '手写 `Function.prototype.myCall`、`myApply`、`myBind`（bind 要支持柯里化）。',
    pass: 'this 绑定对；bind 能分批传参',
  },
  {
    file: '防抖.md',
    title: '防抖 debounce',
    weight: 2,
    ask: '手写 `debounce(fn, wait)`，可带 leading/trailing 之一说明即可。',
    pass: '连续触发只在停顿后执行（或按你声明的 leading 行为一致）',
  },
  {
    file: '节流.md',
    title: '节流 throttle',
    weight: 2,
    ask: '手写 `throttle(fn, wait)`。',
    pass: '间隔内最多执行一次，能跑',
  },
  {
    file: '数组扁平化.md',
    title: '数组扁平化',
    weight: 2,
    ask: '手写 `flatten(arr, depth)`，depth 默认 Infinity。',
    pass: '多层嵌套结果对；depth=1 只展一层',
  },
  {
    file: 'new.md',
    title: '手写 new',
    weight: 1,
    ask: '手写 `myNew(Constructor, ...args)`。',
    pass: '原型链对、返回对象；构造函数 return 对象时以它为准',
  },
  {
    file: 'instanceOf.js',
    title: '手写 instanceof',
    weight: 1,
    ask: '手写 `myInstanceof(obj, Ctor)`。',
    pass: '沿原型链查找，结果与 instanceof 一致',
  },
];

/** 二面算法：中等，1 道。排除一面级插入/选择，排除冷门桶/计数/基数/希尔 */
const SECOND_ROUND_ALGO_FILES = new Set([
  '快排.md',
  '查找.md',
  '动态规划.md',
  '归并排序.md',
  '堆排序.md',
  '背包问题.md',
  '最长公共子串.md',
]);

function practicedToday(progress, id, today) {
  const rec = progress.questions[id];
  return Boolean(rec && rec.lastPracticedAt === today);
}

function pickWeightedList(items, getWeight) {
  if (!items.length) return null;
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= getWeight(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function pickSecondRoundHandwritten(progress, today) {
  const pool = SECOND_ROUND_HANDWRITTEN.filter((item) => {
    const id = `${HANDWRITTEN_DIR}/${item.file}`;
    return !practicedToday(progress, id, today);
  });
  const chosen = pickWeightedList(pool.length ? pool : SECOND_ROUND_HANDWRITTEN, (x) => x.weight);
  if (!chosen) return null;
  const rel = `${HANDWRITTEN_DIR}/${chosen.file}`;
  return {
    id: rel,
    title: chosen.title,
    path: rel,
    type: 'handwritten',
    ask: chosen.ask,
    pass: chosen.pass,
    passThreshold: PASS_SCORE,
    markCommand: `node .cursor/skills/second-round/scripts/mark-question.js "${rel}" --score=<0-10>`,
  };
}

function pickSecondRoundAlgorithm(progress, today) {
  const all = algoQuiz.scanAlgorithmQuestions()
    .filter((q) => SECOND_ROUND_ALGO_FILES.has(path.basename(q.path)));
  const pool = all.filter((q) => !practicedToday(progress, q.id, today));
  const chosen = pickWeightedList(pool.length ? pool : all, (q) => (
    q.frequency === 'high' ? 3 : 2
  ));
  if (!chosen) return null;
  return {
    id: chosen.id,
    title: chosen.title,
    path: chosen.path,
    type: 'algorithm',
    method: chosen.method,
    frequency: chosen.frequency,
    frequencyLabel: chosen.frequencyLabel,
    ask: chosen.ask,
    frontendBar: chosen.frontendBar,
    passThreshold: PASS_SCORE,
    markCommand: `node .cursor/skills/second-round/scripts/mark-question.js "${chosen.id}" --score=<0-10>`,
  };
}

function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(fromStr, toStr) {
  const from = new Date(`${fromStr}T00:00:00`);
  const to = new Date(`${toStr}T00:00:00`);
  return Math.round((to - from) / 86400000);
}

function readTitle(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(filePath, '.md');
}

function scanBank() {
  if (!fs.existsSync(BANK_DIR)) return [];
  return fs
    .readdirSync(BANK_DIR)
    .filter((name) => /^\d+-.*\.md$/i.test(name))
    .sort()
    .map((name) => {
      const id = name.replace(/\.md$/i, '');
      const meta = QUESTION_META[id] || { cluster: 'soft', importance: 'P1', must: false };
      const rel = `二面面试题/${name}`;
      return {
        id,
        title: readTitle(path.join(BANK_DIR, name)),
        path: rel,
        cluster: meta.cluster,
        clusterName: CLUSTERS[meta.cluster]?.name || meta.cluster,
        importance: meta.importance,
        must: meta.must,
      };
    });
}

function emptyProgress() {
  return {
    version: 1,
    passScore: PASS_SCORE,
    dueAfterDays: DUE_AFTER_DAYS,
    pickRatios: PICK_RATIOS,
    questions: {},
  };
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return emptyProgress();
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    if (!data.questions) data.questions = {};
    return data;
  } catch (_err) {
    return emptyProgress();
  }
}

function saveProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function mergeQuestion(bankQ, progress) {
  const rec = progress.questions[bankQ.id] || {};
  return {
    ...bankQ,
    learned: rec.learned || null,
    learnedLabel: rec.learned === 'yes' ? '✓' : rec.learned === 'no' ? '✗' : '',
    lastScore: rec.lastScore ?? null,
    firstLearnedAt: rec.firstLearnedAt || null,
    lastPracticedAt: rec.lastPracticedAt || null,
  };
}

function classifyQuestion(q, today) {
  if (!q.learned) return 'untested';
  if (q.learned === 'no') return 'notLearned';
  const last = q.lastPracticedAt || q.firstLearnedAt;
  if (!last) return 'due';
  return daysBetween(last, today) >= DUE_AFTER_DAYS ? 'due' : 'recent';
}

function pickWithBalancedRatio(due, notLearned, untested, recent) {
  const pools = [
    { name: 'due', list: due, weight: PICK_RATIOS.due },
    { name: 'notLearned', list: notLearned, weight: PICK_RATIOS.notLearned },
    { name: 'untested', list: untested, weight: PICK_RATIOS.untested },
  ].filter((p) => p.list.length > 0);

  if (pools.length === 0) {
    if (!recent.length) return { picked: null, pickSource: null };
    return {
      picked: recent[Math.floor(Math.random() * recent.length)],
      pickSource: 'recent',
    };
  }

  const total = pools.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  let chosen = pools[0];
  for (const p of pools) {
    r -= p.weight;
    if (r <= 0) {
      chosen = p;
      break;
    }
  }
  return {
    picked: chosen.list[Math.floor(Math.random() * chosen.list.length)],
    pickSource: chosen.name,
  };
}

function bucketQuestions(questions, today) {
  const due = [];
  const notLearned = [];
  const untested = [];
  const recent = [];
  for (const q of questions) {
    const bucket = classifyQuestion(q, today);
    if (bucket === 'due') due.push(q);
    else if (bucket === 'notLearned') notLearned.push(q);
    else if (bucket === 'untested') untested.push(q);
    else recent.push(q);
  }
  return { due, notLearned, untested, recent };
}

function relatedOf(clusterId, all, openerId) {
  return all.filter((q) => q.cluster === clusterId && q.id !== openerId);
}

function toPayload(q, extra = {}) {
  return {
    id: q.id,
    title: q.title,
    path: q.path,
    cluster: q.cluster,
    clusterName: q.clusterName,
    importance: q.importance,
    must: q.must,
    learned: q.learned,
    learnedLabel: q.learnedLabel,
    lastScore: q.lastScore,
    firstLearnedAt: q.firstLearnedAt,
    ...extra,
  };
}

function statsFrom(all, today) {
  const { due, notLearned, untested } = bucketQuestions(all, today);
  return {
    total: all.length,
    totalDue: due.length,
    totalNotLearned: notLearned.length,
    totalUntested: untested.length,
  };
}

function pickSession(options = {}) {
  const today = todayStr();
  const progress = loadProgress();
  const bank = scanBank().map((q) => mergeQuestion(q, progress));
  const mode = options.mode === 'single' || options.mode === 'project'
    ? options.mode
    : 'full';
  const includeCoding = mode === 'full';

  if (bank.length === 0) {
    return {
      session: { type: '二面项目深挖', questionCount: 0, mode },
      question: null,
    };
  }

  let picked;
  let pickSource;

  if (mode === 'single') {
    const pool = options.cluster
      ? bank.filter((q) => q.cluster === options.cluster)
      : bank;
    const buckets = bucketQuestions(pool.length ? pool : bank, today);
    const result = pickWithBalancedRatio(
      buckets.due,
      buckets.notLearned,
      buckets.untested,
      buckets.recent,
    );
    picked = result.picked;
    pickSource = result.pickSource;
  } else {
    const clusterIds = options.cluster
      ? [options.cluster]
      : Object.keys(CLUSTERS);
    const openers = clusterIds
      .map((id) => {
        const openerId = CLUSTERS[id]?.opener;
        return bank.find((q) => q.id === openerId);
      })
      .filter(Boolean);
    const pool = openers.length ? openers : bank;
    const buckets = bucketQuestions(pool, today);
    const result = pickWithBalancedRatio(
      buckets.due,
      buckets.notLearned,
      buckets.untested,
      buckets.recent,
    );
    picked = result.picked;
    pickSource = result.pickSource;
  }

  if (!picked) {
    return {
      session: { type: '二面项目深挖', questionCount: 0, mode },
      question: null,
    };
  }

  const cluster = CLUSTERS[picked.cluster];
  const related = relatedOf(picked.cluster, bank, picked.id).map((q) => toPayload(q));
  const handwritten = includeCoding ? pickSecondRoundHandwritten(progress, today) : null;
  const algorithm = includeCoding ? pickSecondRoundAlgorithm(progress, today) : null;
  const sessionType = includeCoding
    ? '二面（项目深挖 + 1 手写 + 1 算法）'
    : mode === 'single' ? '二面单题' : '二面项目深挖';

  return {
    session: {
      type: sessionType,
      mode,
      round: PROFILE.interviewRound,
      interviewer: PROFILE.interviewer,
      companyTier: PROFILE.companyTier,
      targetSalary: PROFILE.targetSalaryLabel,
      yearsOfExperience: PROFILE.yearsOfExperience,
      followUpRounds: mode === 'single' ? 2 : 4,
      questionCount: includeCoding ? 3 : 1,
      parts: includeCoding ? ['project', 'handwritten', 'algorithm'] : ['project'],
      pickSource,
    },
    dueStats: statsFrom(bank, today),
    project: cluster
      ? { id: cluster.id, name: cluster.name, opener: cluster.opener }
      : null,
    question: toPayload(picked),
    relatedQuestions: mode === 'single' ? [] : related,
    handwritten,
    algorithm,
    markCommand: `node .cursor/skills/second-round/scripts/mark-question.js "${picked.id}" --score=<0-10>`,
    passThreshold: PASS_SCORE,
    note: includeCoding
      ? '顺序：项目深挖 → 1 道 JS 手写 → 1 道中等算法。综合分 ≥6 打 ✓。面试中途不泄露题库答案；不要提前公布手写/算法题名。'
      : '综合分 ≥6 打 ✓；面试中途不泄露题库答案；追问须超出「常见追问」',
  };
}

function markQuestion(id, score) {
  if (!id) {
    throw new Error('缺少 question id');
  }
  if (Number.isNaN(score) || score < 0 || score > 10) {
    throw new Error('score 必须是 0～10 的数字');
  }

  const today = todayStr();
  const progress = loadProgress();
  const bank = scanBank();
  const meta = bank.find((q) => q.id === id);
  const prev = progress.questions[id] || {};
  const passed = score >= PASS_SCORE;

  const next = {
    learned: passed ? 'yes' : 'no',
    lastScore: score,
    lastPracticedAt: today,
    firstLearnedAt: passed ? (prev.firstLearnedAt || today) : null,
  };

  progress.questions[id] = next;
  saveProgress(progress);

  return {
    ok: true,
    id,
    title: meta?.title || id,
    score,
    threshold: PASS_SCORE,
    passed,
    learned: next.learned,
    learnedLabel: passed ? '✓' : '✗',
    firstLearnedAt: next.firstLearnedAt,
  };
}

module.exports = {
  PROFILE,
  CLUSTERS,
  PASS_SCORE,
  scanBank,
  loadProgress,
  pickSession,
  markQuestion,
  SECOND_ROUND_HANDWRITTEN,
  SECOND_ROUND_ALGO_FILES,
};
