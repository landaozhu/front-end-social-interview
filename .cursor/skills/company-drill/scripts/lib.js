const fs = require('fs');
const path = require('path');
const {
  loadData,
  initOrSyncData,
  getDueQuestions,
  getPassThreshold,
  isRetired,
  wasAttemptedToday,
  todayStr,
  PROJECT_ROOT,
} = require('../../spaced-review/scripts/lib');
const { isAgentTrack } = require('../../spaced-review/scripts/question-filters');

const PROGRESS_FILE = path.join(__dirname, '..', 'progress.json');

const DOMAINS = [
  { id: 'security', label: '安全' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'engineering', label: '工程化' },
  { id: 'microfrontend', label: '微前端' },
  { id: 'network', label: '网络' },
  { id: 'node', label: 'Node' },
  { id: 'performance', label: '性能' },
  { id: 'browser', label: '浏览器' },
  { id: 'principle', label: 'JS原理' },
  { id: 'handwritten', label: '手写' },
  { id: 'css', label: 'CSS' },
  { id: 'html', label: 'HTML' },
  { id: 'algorithm', label: '算法' },
  { id: 'agent', label: 'Agent' },
  { id: 'other', label: '其他' },
];

const IMP_W = { P0: 10, P1: 5, P2: 1.5, P3: 0.25 };

function normPath(q) {
  return (q.path || '').replace(/\\/g, '/');
}

function haystackOf(q) {
  return `${normPath(q)} ${q.category || ''} ${q.title || ''}`;
}

function getDomain(q) {
  const p = normPath(q);
  const hay = haystackOf(q);

  if (isAgentTrack(q)) return 'agent';
  if (/\/algorithm\/|\/dataStructure\//.test(p)) return 'algorithm';
  if (p.startsWith('interview/handwritten/') || q.category === 'handwritten') return 'handwritten';
  if (/xss|csrf|csp|网络安全|网络攻击|劫持|cookie.*窃取/i.test(hay) || /网络安全/.test(p)) return 'security';
  if (p.startsWith('interview/微前端/') || /微前端|qiankun|模块联邦|module federation/.test(hay)) {
    return 'microfrontend';
  }
  if (p.startsWith('interview/ts/') || /typescript|高级类型|范型|泛型|方法重载|unknown和any|ts有啥/i.test(hay)) {
    return 'ts';
  }
  if (p.startsWith('interview/node/')) return 'node';
  if (p.startsWith('interview/网络/')) return 'network';
  if (
    /性能优化|首屏|FCP|lighthouse|弱网|长列表|虚拟滚动/i.test(hay)
    && !p.startsWith('interview/webpack/')
  ) {
    return 'performance';
  }
  if (
    p.startsWith('interview/webpack/')
    || p.startsWith('interview/vite/')
    || /vite对比webpack/.test(hay)
  ) {
    return 'engineering';
  }
  if (
    p.startsWith('interview/vue/')
    || p.startsWith('interview/vue3/')
    || /vue2和vue3|computed对比watch|vuex和redux|ref对比reactive|uni-?app/.test(hay)
  ) {
    return 'vue';
  }
  if (p.startsWith('interview/react/') || /useEffect和useLayoutEffect|useMemo|useCallback|redux|ssr请求/i.test(hay)) {
    return 'react';
  }
  if (p.startsWith('interview/浏览器/') || /eventloop|event loop|渲染机制|重排|重绘/.test(hay)) {
    return 'browser';
  }
  if (p.startsWith('interview/css/') || q.category === 'css') return 'css';
  if (p.startsWith('interview/html/')) return 'html';
  if (
    p.startsWith('interview/js/')
    || p.startsWith('interview/es5/')
    || p.startsWith('interview/es6/')
    || /esModules和commonjs/.test(hay)
  ) {
    return 'principle';
  }
  return 'other';
}

function domainLabel(id) {
  return DOMAINS.find((d) => d.id === id)?.label || id;
}

function gapKind(q, dueIds) {
  if (q.learned === 'no') return 'notLearned';
  if (q.learned === 'yes') return dueIds.has(q.id) ? 'due' : 'learned';
  return 'untested';
}

function questionGapScore(q, dueIds) {
  const imp = IMP_W[q.importance] || 1;
  const kind = gapKind(q, dueIds);
  if (kind === 'notLearned') return 10 * imp;
  if (kind === 'untested') return 6 * imp;
  if (kind === 'due') return 4 * imp;
  return 0;
}

function toGapItem(q, dueIds) {
  return {
    id: q.id,
    title: q.title,
    domain: getDomain(q),
    domainLabel: domainLabel(getDomain(q)),
    importance: q.importance,
    learned: q.learned,
    learnedLabel: q.learned === 'yes' ? '✓' : q.learned === 'no' ? '✗' : '',
    path: q.path,
    gapKind: gapKind(q, dueIds),
    gapScore: questionGapScore(q, dueIds),
    passThreshold: getPassThreshold(q.importance),
    markCommand: `node .cursor/skills/company-drill/scripts/mark-question.js "${q.id}" --score=<0-10>`,
  };
}

function parseList(raw) {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function analyzeGaps(data, options = {}) {
  const today = options.today || todayStr();
  const boost = parseList(options.boost);
  const skip = parseList(options.skip);
  if (!skip.includes('agent') && options.includeAgent !== true) skip.push('agent');

  const dueIds = new Set(getDueQuestions(data, today).map((d) => d.question.id));
  const eligible = data.questions.filter((q) => !isRetired(q) && !skip.includes(getDomain(q)));

  const byDomain = new Map();
  for (const q of eligible) {
    const id = getDomain(q);
    if (!byDomain.has(id)) byDomain.set(id, []);
    byDomain.get(id).push(q);
  }

  const domains = [...byDomain.entries()].map(([id, qs]) => {
    const items = qs.map((q) => toGapItem(q, dueIds));
    const counts = {
      notLearned: items.filter((i) => i.gapKind === 'notLearned').length,
      untested: items.filter((i) => i.gapKind === 'untested').length,
      due: items.filter((i) => i.gapKind === 'due').length,
      learned: items.filter((i) => i.gapKind === 'learned').length,
    };
    const gapScore = items.reduce((s, i) => s + i.gapScore, 0);
    const boosted = boost.indexOf(id);
    return {
      id,
      label: domainLabel(id),
      boosted: boosted >= 0,
      boostRank: boosted >= 0 ? boosted : 99,
      gapScore,
      counts,
      topGaps: items
        .filter((i) => i.gapScore > 0)
        .sort((a, b) => b.gapScore - a.gapScore)
        .slice(0, 8),
    };
  }).sort((a, b) => {
    if (a.boostRank !== b.boostRank) return a.boostRank - b.boostRank;
    return b.gapScore - a.gapScore;
  });

  const topGaps = eligible
    .map((q) => toGapItem(q, dueIds))
    .filter((i) => i.gapScore > 0)
    .sort((a, b) => {
      const ar = boost.indexOf(a.domain);
      const br = boost.indexOf(b.domain);
      const aRank = ar >= 0 ? ar : 99;
      const bRank = br >= 0 ? br : 99;
      if (aRank !== bRank) return aRank - bRank;
      return b.gapScore - a.gapScore;
    })
    .slice(0, 20);

  return {
    profile: data.profile,
    today,
    boost,
    skip,
    summary: {
      notLearned: eligible.filter((q) => q.learned === 'no').length,
      untested: eligible.filter((q) => q.learned !== 'yes' && q.learned !== 'no').length,
      due: eligible.filter((q) => dueIds.has(q.id)).length,
      learned: eligible.filter((q) => q.learned === 'yes' && !dueIds.has(q.id)).length,
    },
    domains,
    topGaps,
    note: '特训出题不要用 25/25/50 混抽。按公司命中 × 弱项缺口排序，一题一题补。',
  };
}

function matchTopics(data, topics, options = {}) {
  const today = options.today || todayStr();
  const dueIds = new Set(getDueQuestions(data, today).map((d) => d.question.id));
  const needles = (topics || []).map((t) => t.trim()).filter(Boolean);
  if (needles.length === 0) return [];

  return data.questions
    .filter((q) => !isRetired(q) && !wasAttemptedToday(q, today))
    .filter((q) => {
      const hay = haystackOf(q).toLowerCase();
      return needles.some((n) => hay.includes(n.toLowerCase()));
    })
    .map((q) => toGapItem(q, dueIds))
    .sort((a, b) => b.gapScore - a.gapScore);
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return null;
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, `${JSON.stringify(progress, null, 2)}\n`);
  return progress;
}

function startSession({ company, tier, round, jdKeywords }) {
  const progress = {
    company: company || '',
    tier: tier || '',
    round: round || '一面',
    jdKeywords: jdKeywords || [],
    startedAt: todayStr(),
    asked: [],
  };
  return saveProgress(progress);
}

function addAsked(entry) {
  const progress = loadProgress();
  if (!progress) {
    throw new Error('没有进行中的特训，先 --start');
  }
  progress.asked.push({
    title: entry.title,
    localId: entry.localId || null,
    domain: entry.domain || '',
    source: entry.source || 'invented',
    score: entry.score == null ? null : Number(entry.score),
    passed: Boolean(entry.passed),
    askedAt: todayStr(),
  });
  return saveProgress(progress);
}

const DOMAIN_TO_DIR = {
  vue: 'interview/vue',
  react: 'interview/react',
  ts: 'interview/ts',
  engineering: 'interview/webpack',
  network: 'interview/网络',
  node: 'interview/node',
  microfrontend: 'interview/微前端',
  performance: 'interview/浏览器',
  browser: 'interview/浏览器',
  principle: 'interview/js',
  handwritten: 'interview/handwritten',
  security: 'interview/网络',
  css: 'interview/css',
};

function slugTitle(title) {
  return String(title || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 40) || '特训题';
}

function findListMatch(data, { localId, title, topics }) {
  if (localId) {
    const hit = data.questions.find((q) => q.id === localId || q.path === localId);
    if (hit) return hit;
  }
  const needles = parseList(topics);
  if (title) needles.unshift(title);
  if (needles.length === 0) return null;

  const matches = matchTopics(data, needles);
  const interviewOk = (m) => /^interview\//.test(m.path || '') && /\.md$/i.test(m.path || '');
  const pool = matches.filter(interviewOk);
  const search = pool.length > 0 ? pool : matches;
  const exact = search.find((m) => {
    const a = (m.title || '').replace(/\s+/g, '');
    const b = String(title || '').replace(/\s+/g, '');
    return a && b && (a === b || a.includes(b) || b.includes(a));
  });
  const chosen = exact || search[0];
  if (!chosen) return null;
  if (!interviewOk(chosen) && !localId) return null;
  return data.questions.find((q) => q.id === chosen.id) || null;
}

function appendFollowUps(mdRel, followUps) {
  const followUpsClean = (followUps || []).filter(Boolean);
  if (followUpsClean.length === 0) return;
  const abs = path.join(PROJECT_ROOT, mdRel);
  if (!fs.existsSync(abs)) return;
  let text = fs.readFileSync(abs, 'utf8');
  const missing = followUpsClean.filter((q) => !text.includes(q));
  if (missing.length === 0) return;
  const block = missing.map((q) => `- ${q}`).join('\n');
  if (/## 追问/.test(text)) {
    text = `${text.trimEnd()}\n${block}\n`;
  } else {
    text = `${text.trimEnd()}\n\n## 追问\n\n${block}\n`;
  }
  fs.writeFileSync(abs, text, 'utf8');
}

function askedTitles(progress) {
  return new Set((progress?.asked || []).map((a) => (a.title || '').toLowerCase()));
}

function askedLocalIds(progress) {
  return new Set((progress?.asked || []).map((a) => a.localId).filter(Boolean));
}

function loadReviewData() {
  let data = loadData();
  if (!data) data = initOrSyncData();
  return data;
}

function getArg(args, name) {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

module.exports = {
  PROJECT_ROOT,
  PROGRESS_FILE,
  DOMAINS,
  getDomain,
  domainLabel,
  analyzeGaps,
  matchTopics,
  loadProgress,
  saveProgress,
  startSession,
  addAsked,
  askedTitles,
  askedLocalIds,
  loadReviewData,
  getArg,
  parseList,
  DOMAIN_TO_DIR,
  slugTitle,
  findListMatch,
  appendFollowUps,
};
