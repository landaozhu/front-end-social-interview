const fs = require('fs');
const path = require('path');
const {
  loadData,
  initOrSyncData,
  getDueQuestions,
  getNotLearnedQuestions,
  getUntestedQuestions,
  getImportanceLabel,
  getPassThreshold,
  pickWeightedFromPool,
  PROJECT_ROOT,
  todayStr,
  wasAttemptedToday,
  isRetired,
} = require('../../spaced-review/scripts/lib');

/** 模拟面试专用画像（与 25k考察列表 profile 独立） */
const MOCK_PROFILE = {
  name: '兰为鹏',
  yearsOfExperience: 9,
  level: 'senior',
  targetCity: '上海',
  targetSalary: 25000,
  targetSalaryLabel: '25k',
  interviewRound: '一面',
  companyTier: '中大厂（非顶尖）',
};

const KNOWLEDGE_COUNT = 10;
const READING_COUNT = 1;
const HANDWRITTEN_COUNT = 2;
const QUESTION_COUNT = KNOWLEDGE_COUNT + READING_COUNT + HANDWRITTEN_COUNT;

/**
 * 10 道八股必须覆盖的方向（一面广度）
 * 出题顺序：原理开场 → 网络/框架/TS/Node → 工程化 → 微前端
 * 原理 = Vue / React / Webpack 实现原理，不是浏览器 / JS 基础。
 */
const KNOWLEDGE_DOMAINS = [
  { id: 'principle', label: '原理' },
  { id: 'network', label: '网络' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'node', label: 'Node' },
  { id: 'engineering', label: '工程化' },
  { id: 'microfrontend', label: '微前端' },
];

/** Vue / React / Webpack 目录才可能当「原理」开场 */
const PRINCIPLE_STACK_PATH_RE = /^interview\/(vue3?|react|webpack)\//;

/** 实现原理题：响应式、Fiber、HMR、编译优化等；不含常用配置 / 插槽 / 生命周期 API */
const PRINCIPLE_TOPIC_RE =
  /原理|源码|响应式|fiber|虚拟dom|virtual\s*dom|diff|编译优化|patchflag|静态提升|hmr|热更新|打包构建|nexttick|更新机制|setstate|事件系统/i;

const EXTRA_KNOWLEDGE = KNOWLEDGE_COUNT - KNOWLEDGE_DOMAINS.length;
const LEVEL_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

/**
 * 一面专用抽题：80% 已通过 ✓，20% 未通过 ✗。未测不抽。
 * 已通过池优先到期复习，没有到期再抽其他已通过。
 * 自我考察仍走 25k 表的 25/25/50。
 */
const MOCK_PASSED_RATIO = 0.8;
const MOCK_NOT_LEARNED_RATIO = 0.2;
const MOCK_PICK_RATIOS = { due: 0.8, notLearned: 0.2, untested: 0 };

/** 八股文排除：无独立答案文件的目录/类目 */
const KNOWLEDGE_EXCLUDE_PATH_RE =
  /^interview\/(handwritten|阅读代码题|优化|场景题|agent)\//;

/**
 * 八股文选题范围（必须在 25k考察列表 内，且 path 指向 interview/ 下独立 .md 答案）
 * 排除：compony / 牛客 / 面试题汇总（只有题单、无独立答案，增加搜题负担）
 */
function isKnowledgeEligible(q) {
  const p = (q.path || '').replace(/\\/g, '/');
  if (q.source !== 'interview') return false;
  if (q.category === 'handwritten') return false;
  if (!p.startsWith('interview/') || !/\.md$/i.test(p)) return false;
  if (KNOWLEDGE_EXCLUDE_PATH_RE.test(p)) return false;
  return fs.existsSync(path.join(PROJECT_ROOT, p));
}

function isHandwrittenEligible(q) {
  const p = (q.path || '').replace(/\\/g, '/');
  return (
    q.category === 'handwritten'
    && p.startsWith('interview/handwritten/')
    && /\.md$/i.test(p)
    && fs.existsSync(path.join(PROJECT_ROOT, p))
  );
}

function questionHaystack(q) {
  const p = (q.path || '').replace(/\\/g, '/');
  return { p, haystack: `${p} ${q.category || ''} ${q.title || ''}` };
}

/**
 * 原理槽：只抽 Vue / React / Webpack 的实现原理。
 * 浏览器、Performance、JS 基础（闭包 / 原型链 / Event Loop）不算原理开场。
 * 题目本身仍归 vue / react / engineering，避免和后续覆盖槽抢分类。
 */
function isPrincipleQuestion(q) {
  const { p, haystack } = questionHaystack(q);
  return PRINCIPLE_STACK_PATH_RE.test(p) && PRINCIPLE_TOPIC_RE.test(haystack);
}

function getKnowledgeDomain(q) {
  const { p, haystack } = questionHaystack(q);

  if (p.startsWith('interview/微前端/') || /微前端|qiankun|模块联邦|module federation/.test(haystack)) {
    return 'microfrontend';
  }
  if (p.startsWith('interview/ts/') || /undown和any|ts和java/.test(haystack)) {
    return 'ts';
  }
  if (p.startsWith('interview/node/')) return 'node';
  if (p.startsWith('interview/网络/')) return 'network';
  if (
    p.startsWith('interview/webpack/')
    || p.startsWith('interview/vite/')
    || /vite对比webpack/.test(haystack)
  ) {
    return 'engineering';
  }
  if (p.startsWith('interview/vue/')
    || p.startsWith('interview/vue3/')
    || p.startsWith('interview/选型/')
    || /vue2和vue3|computed对比watch|vuex和redux|路由模式|ref对比reactive/.test(haystack)
  ) {
    return 'vue';
  }
  if (p.startsWith('interview/react/') || /useEffect和useLayoutEffect/.test(haystack)) {
    return 'react';
  }
  return null;
}

function matchesCoverageDomain(q, domainId) {
  if (domainId === 'principle') return isPrincipleQuestion(q);
  return getKnowledgeDomain(q) === domainId;
}

function domainLabel(id) {
  return KNOWLEDGE_DOMAINS.find((d) => d.id === id)?.label || id || '其他';
}

function scanReadingCodeQuestions() {
  const dir = path.join(PROJECT_ROOT, 'interview/阅读代码题');
  const list = [];
  if (!fs.existsSync(dir)) return list;

  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!f.isFile() || !/\.js$/i.test(f.name)) continue;
    const rel = path.relative(PROJECT_ROOT, path.join(dir, f.name)).replace(/\\/g, '/');
    const title = f.name.replace(/\.js$/i, '');
    list.push({
      id: rel,
      title,
      category: '阅读代码题',
      path: rel,
      source: '阅读代码题',
      importance: 'P1',
      importanceLabel: 'P1 高频',
    });
  }

  return list;
}

function weightedPickOne(pool, excludeIds = new Set()) {
  const candidates = pool.filter((d) => !excludeIds.has(d.question.id));
  return pickWeightedFromPool(candidates);
}

function toPassedItem(q, today) {
  return {
    question: q,
    stageId: null,
    stageLabel: '已通过 ✓',
    dueDate: today,
    overdueDays: 0,
  };
}

function getPassedPool(data, today, filterFn) {
  return data.questions
    .filter((q) => q.learned === 'yes' && filterFn(q) && !wasAttemptedToday(q, today) && !isRetired(q))
    .map((q) => toPassedItem(q, today));
}

function buildMarkablePool(data, today, filterFn, minImportance) {
  const skipToday = (d) => !wasAttemptedToday(d.question, today) && !isRetired(d.question);
  let due = getDueQuestions(data, today).filter((d) => filterFn(d.question)).filter(skipToday);
  let passed = getPassedPool(data, today, filterFn);
  let notLearned = getNotLearnedQuestions(data).filter((d) => filterFn(d.question)).filter(skipToday);

  if (minImportance) {
    const maxOrder = LEVEL_ORDER[minImportance];
    const filterByMin = (pool) => {
      const filtered = pool.filter((d) => (LEVEL_ORDER[d.question.importance] ?? 2) <= maxOrder);
      return filtered.length > 0 ? filtered : pool;
    };
    due = filterByMin(due);
    passed = filterByMin(passed);
    notLearned = filterByMin(notLearned);
  }

  return { due, passed, notLearned, untested: [] };
}

function getReadingPool(today, data) {
  const storedById = new Map((data?.questions || []).map((q) => [q.id, q]));
  return scanReadingCodeQuestions()
    .map((q) => {
      const stored = storedById.get(q.id);
      const question = stored
        ? {
            ...q,
            retired: stored.retired,
            retiredAt: stored.retiredAt,
            lastAttemptedAt: stored.lastAttemptedAt,
            learned: stored.learned,
          }
        : q;
      return {
        question,
        stageId: null,
        stageLabel: '阅读代码',
        dueDate: today,
        overdueDays: 0,
      };
    })
    .filter((d) => !isRetired(d.question) && !wasAttemptedToday(d.question, today));
}

function toCoverageItem(q, today, stageLabel = '覆盖抽') {
  return {
    question: q,
    stageId: null,
    stageLabel,
    dueDate: today,
    overdueDays: 0,
  };
}

function pickPassedFromPools(due, passed) {
  if (due.length > 0) {
    return { picked: pickWeightedFromPool(due), pickSource: 'due' };
  }
  if (passed.length > 0) {
    return { picked: pickWeightedFromPool(passed), pickSource: 'learned' };
  }
  return { picked: null, pickSource: null };
}

/** 80% 已通过（到期优先），20% 未通过。未测不抽。某池为空则顺延。 */
function pickMockFromPools(due, passed, notLearned) {
  if (due.length === 0 && passed.length === 0 && notLearned.length === 0) {
    return { picked: null, pickSource: null };
  }
  const preferPassed = Math.random() < MOCK_PASSED_RATIO;
  if (preferPassed) {
    const fromPassed = pickPassedFromPools(due, passed);
    if (fromPassed.picked) return fromPassed;
    if (notLearned.length > 0) {
      return { picked: pickWeightedFromPool(notLearned), pickSource: 'notLearned' };
    }
  } else {
    if (notLearned.length > 0) {
      return { picked: pickWeightedFromPool(notLearned), pickSource: 'notLearned' };
    }
    const fromPassed = pickPassedFromPools(due, passed);
    if (fromPassed.picked) return fromPassed;
  }
  return { picked: null, pickSource: null };
}

function pickFromPools(pools, excludeIds) {
  const filter = (arr) => arr.filter((d) => !excludeIds.has(d.question.id));
  return pickMockFromPools(
    filter(pools.due),
    filter(pools.passed || []),
    filter(pools.notLearned),
  );
}

/** 必考方向先已通过（到期优先）；该方向没有已通过才抽未通过。未测不在这里抽。 */
function pickCoverageFromPools(due, passed, notLearned) {
  const fromPassed = pickPassedFromPools(due, passed);
  if (fromPassed.picked) return fromPassed;
  if (notLearned.length > 0) {
    return { picked: pickWeightedFromPool(notLearned), pickSource: 'notLearned' };
  }
  return { picked: null, pickSource: null };
}

function countNotLearnedPicks(picks) {
  return picks.filter((p) => {
    if (p.pickSource === 'notLearned') return true;
    const q = p.picked?.question || p.item?.question;
    return q && q.learned === 'no';
  }).length;
}

/** 未通过池里按 P0/P1 优先抽，不限方向。用于把整场未通过补到约 20%。 */
function pickAnyNotLearned(pool, excludeIds) {
  const result = pickByImportanceTiers(
    (cap) => {
      const items = pool.filter(
        (d) => !excludeIds.has(d.question.id) && withinImportance(d, cap),
      );
      if (items.length === 0) return { picked: null, pickSource: null };
      return { picked: pickWeightedFromPool(items), pickSource: 'notLearned' };
    },
    pool.filter((d) => !excludeIds.has(d.question.id)),
    excludeIds,
  );
  if (result.picked) result.pickSource = 'notLearned';
  return result;
}

/** 已通过池（到期优先）按 P0/P1 抽，把整场已通过补到约 80%。 */
function pickAnyPassed(duePool, passedPool, excludeIds) {
  const dueHit = pickAnyNotLearned(duePool, excludeIds);
  if (dueHit.picked) {
    dueHit.pickSource = 'due';
    return dueHit;
  }
  const passedHit = pickAnyNotLearned(passedPool, excludeIds);
  if (passedHit.picked) passedHit.pickSource = 'learned';
  return passedHit;
}

function withinImportance(d, cap) {
  if (!cap) return true;
  return (LEVEL_ORDER[d.question.importance] ?? 2) <= LEVEL_ORDER[cap];
}

/** 必考方向优先 P0/P1，没有再降到 P2、P3 */
function pickByImportanceTiers(pickAtCap, fallbackItems, excludeIds) {
  for (const cap of ['P1', 'P2', null]) {
    const result = pickAtCap(cap);
    if (result.picked) return result;
  }
  for (const cap of ['P1', 'P2', null]) {
    const pool = fallbackItems.filter((d) => withinImportance(d, cap));
    const picked = weightedPickOne(pool, excludeIds);
    if (picked) return { picked, pickSource: 'coverage' };
  }
  return { picked: null, pickSource: null };
}

function pickRequiredDomain(domain, knowledgePools, data, today, excludeIds, minImportance) {
  const inDomain = (q) => isKnowledgeEligible(q) && matchesCoverageDomain(q, domain.id);
  const tested = (q) => q.learned === 'yes' || q.learned === 'no';
  const filterPool = (arr, cap) => arr.filter(
    (d) => inDomain(d.question) && !excludeIds.has(d.question.id) && withinImportance(d, cap),
  );

  const toFallback = (pred) => {
    let items = data.questions
      .filter(inDomain)
      .filter((q) => !wasAttemptedToday(q, today) && !isRetired(q) && pred(q))
      .map((q) => toCoverageItem(q, today));
    if (minImportance) {
      const maxOrder = LEVEL_ORDER[minImportance];
      const filtered = items.filter(
        (d) => (LEVEL_ORDER[d.question.importance] ?? 2) <= maxOrder,
      );
      if (filtered.length > 0) items = filtered;
    }
    return items;
  };

  let fallback = toFallback(tested);
  if (fallback.length === 0) fallback = toFallback(() => true);

  const result = pickByImportanceTiers(
    (cap) => pickCoverageFromPools(
      filterPool(knowledgePools.due, cap),
      filterPool(knowledgePools.passed, cap),
      filterPool(knowledgePools.notLearned, cap),
    ),
    fallback,
    excludeIds,
  );
  return { ...result, domainId: domain.id };
}

function pickExtraKnowledge(knowledgePools, data, today, excludeIds, extraDomainUsed) {
  const prefer = (q, cap) => {
    if (!isKnowledgeEligible(q) || excludeIds.has(q.id) || wasAttemptedToday(q, today) || isRetired(q)) return false;
    if (q.learned !== 'yes' && q.learned !== 'no') return false;
    const domainId = getKnowledgeDomain(q);
    if (!domainId || extraDomainUsed.has(domainId)) return false;
    return withinImportance({ question: q }, cap);
  };

  const fallback = data.questions
    .filter((q) => {
      if (!isKnowledgeEligible(q) || excludeIds.has(q.id) || wasAttemptedToday(q, today) || isRetired(q)) return false;
      if (q.learned !== 'yes' && q.learned !== 'no') return false;
      const domainId = getKnowledgeDomain(q);
      return domainId && !extraDomainUsed.has(domainId);
    })
    .map((q) => toCoverageItem(q, today));

  const result = pickByImportanceTiers(
    (cap) => pickMockFromPools(
      knowledgePools.due.filter((d) => prefer(d.question, cap)),
      knowledgePools.passed.filter((d) => prefer(d.question, cap)),
      knowledgePools.notLearned.filter((d) => prefer(d.question, cap)),
    ),
    fallback,
    excludeIds,
  );
  return { ...result, domainId: result.picked ? getKnowledgeDomain(result.picked.question) : null };
}

function pickManyFromPools(pools, data, excludeIds, count, fallbackItems) {
  const items = [];
  for (let i = 0; i < count; i += 1) {
    let { picked, pickSource } = pickFromPools(pools, excludeIds);
    if (!picked && fallbackItems) {
      picked = weightedPickOne(fallbackItems, excludeIds);
      pickSource = picked ? 'coverage' : null;
    }
    if (!picked) break;
    excludeIds.add(picked.question.id);
    items.push({ item: picked, pickSource });
  }
  return items;
}

function toQuestionPayload(item, slot, type, extra = {}) {
  if (!item) return null;
  const { question, stageId, stageLabel, dueDate, overdueDays } = item;
  return {
    slot,
    type,
    id: question.id,
    title: question.title,
    importance: question.importance,
    importanceLabel: question.importanceLabel || getImportanceLabel(question.importance),
    category: question.category,
    path: question.path,
    stageId,
    stageLabel,
    dueDate,
    overdueDays,
    followUpRequired: type !== 'handwritten',
    markable: type !== 'reading',
    learned: question.learned,
    learnedLabel: question.learned === 'yes' ? '✓' : question.learned === 'no' ? '✗' : '',
    passThreshold: type !== 'reading' ? getPassThreshold(question.importance) : null,
    markCommand: type !== 'reading'
      ? `node .cursor/skills/mock-interview/scripts/mark-question.js "${question.id}" --score=<0-10>`
      : null,
    ...extra,
  };
}

function pickSession(data, today = todayStr(), options = {}) {
  const knowledgePools = buildMarkablePool(
    data, today, isKnowledgeEligible, options.minImportance,
  );
  const handwrittenPools = buildMarkablePool(
    data, today, isHandwrittenEligible, options.minImportance,
  );
  const readingPool = getReadingPool(today, data);
  const excludeIds = new Set();
  const knowledgePicks = [];

  for (const domain of KNOWLEDGE_DOMAINS) {
    const result = pickRequiredDomain(
      domain, knowledgePools, data, today, excludeIds, options.minImportance,
    );
    if (!result.picked) continue;
    excludeIds.add(result.picked.question.id);
    knowledgePicks.push(result);
  }

  const extraDomainUsed = new Set();
  const markableTotal = KNOWLEDGE_COUNT + HANDWRITTEN_COUNT;
  const notLearnedTarget = Math.round(markableTotal * MOCK_NOT_LEARNED_RATIO);
  const hwNlAvailable = handwrittenPools.notLearned.filter(
    (d) => !excludeIds.has(d.question.id),
  ).length;
  const reserveHwNl = Math.min(HANDWRITTEN_COUNT, notLearnedTarget, hwNlAvailable);
  const knowledgeNlTarget = Math.max(0, notLearnedTarget - reserveHwNl);

  for (let i = 0; i < EXTRA_KNOWLEDGE; i += 1) {
    const nlSoFar = countNotLearnedPicks(knowledgePicks);
    const behind = nlSoFar < knowledgeNlTarget;
    let result = behind
      ? pickAnyNotLearned(knowledgePools.notLearned, excludeIds)
      : pickAnyPassed(knowledgePools.due, knowledgePools.passed, excludeIds);
    if (!result || !result.picked) {
      if (behind) {
        result = pickExtraKnowledge(
          knowledgePools, data, today, excludeIds, extraDomainUsed,
        );
      } else {
        result = pickAnyPassed(knowledgePools.due, knowledgePools.passed, excludeIds);
      }
    }
    if (!result.picked) break;
    excludeIds.add(result.picked.question.id);
    if (result.domainId) extraDomainUsed.add(result.domainId);
    else if (result.picked) {
      const domainId = getKnowledgeDomain(result.picked.question);
      if (domainId) extraDomainUsed.add(domainId);
      result.domainId = domainId;
    }
    knowledgePicks.push(result);
  }

  const readingPicks = pickManyFromPools(
    { due: readingPool, passed: readingPool, notLearned: [] },
    data,
    excludeIds,
    READING_COUNT,
    readingPool,
  );

  const handwrittenFallback = data.questions
    .filter(isHandwrittenEligible)
    .filter((q) => !wasAttemptedToday(q, today) && !isRetired(q))
    .filter((q) => q.learned === 'yes' || q.learned === 'no')
    .map((q) => toCoverageItem(q, today));
  const handwrittenPicks = [];
  for (let i = 0; i < HANDWRITTEN_COUNT; i += 1) {
    const nlSoFar = countNotLearnedPicks(knowledgePicks) + countNotLearnedPicks(handwrittenPicks);
    const behind = nlSoFar < notLearnedTarget;
    let picked = null;
    let pickSource = null;
    if (behind) {
      const forced = pickAnyNotLearned(handwrittenPools.notLearned, excludeIds);
      picked = forced.picked;
      pickSource = forced.pickSource;
    } else {
      const forced = pickAnyPassed(handwrittenPools.due, handwrittenPools.passed, excludeIds);
      picked = forced.picked;
      pickSource = forced.pickSource;
    }
    if (!picked && behind) {
      const fallbackPick = pickFromPools(handwrittenPools, excludeIds);
      picked = fallbackPick.picked;
      pickSource = fallbackPick.pickSource;
    }
    if (!picked) {
      const passedOnly = handwrittenFallback.filter((d) => d.question.learned === 'yes');
      const pool = behind ? handwrittenFallback : passedOnly;
      if (pool.length) {
        picked = weightedPickOne(pool, excludeIds);
        pickSource = picked
          ? (picked.question.learned === 'no' ? 'notLearned' : 'learned')
          : null;
      }
    }
    if (!picked) break;
    excludeIds.add(picked.question.id);
    handwrittenPicks.push({ item: picked, pickSource });
  }

  const questions = [];
  let slot = 1;
  const seenDomain = new Set();

  for (const { picked, pickSource, domainId } of knowledgePicks) {
    const requiredCoverage = Boolean(
      domainId && !seenDomain.has(domainId) && KNOWLEDGE_DOMAINS.some((d) => d.id === domainId),
    );
    if (domainId) seenDomain.add(domainId);
    questions.push(toQuestionPayload(picked, slot, 'knowledge', {
      domainId,
      domainLabel: domainLabel(domainId),
      pickSource,
      requiredCoverage,
    }));
    slot += 1;
  }

  for (const { item, pickSource } of readingPicks) {
    questions.push(toQuestionPayload(item, slot, 'reading', { pickSource }));
    slot += 1;
  }
  for (const { item, pickSource } of handwrittenPicks) {
    questions.push(toQuestionPayload(item, slot, 'handwritten', { pickSource }));
    slot += 1;
  }

  const covered = KNOWLEDGE_DOMAINS
    .filter((d) => knowledgePicks.some((x) => x.domainId === d.id))
    .map((d) => d.label);

  const due = getDueQuestions(data, today);
  const notLearned = getNotLearnedQuestions(data);
  const untested = getUntestedQuestions(data);

  return {
    session: {
      type: '一面模拟（整场）',
      round: MOCK_PROFILE.interviewRound,
      companyTier: MOCK_PROFILE.companyTier,
      targetSalary: MOCK_PROFILE.targetSalaryLabel,
      yearsOfExperience: MOCK_PROFILE.yearsOfExperience,
      questionCount: questions.length,
      knowledgeCount: knowledgePicks.length,
      readingCount: readingPicks.length,
      handwrittenCount: handwrittenPicks.length,
      coverage: covered,
      coverageComplete: covered.length === KNOWLEDGE_DOMAINS.length,
    },
    dueStats: {
      totalDue: due.length,
      totalNotLearned: notLearned.length,
      totalUntested: untested.length,
    },
    questions,
    note: '10 八股必须覆盖 8 方向；再加 1 阅读 + 2 手写。整场 80% 已通过 ✓、20% 未通过 ✗，未测不抽。已通过优先到期。不要把后续题目提前告诉候选人。',
  };
}

function loadReviewData() {
  let data = loadData();
  if (!data) data = initOrSyncData();
  return data;
}

module.exports = {
  MOCK_PROFILE,
  MOCK_PICK_RATIOS,
  MOCK_NOT_LEARNED_RATIO,
  MOCK_PASSED_RATIO,
  KNOWLEDGE_COUNT,
  READING_COUNT,
  HANDWRITTEN_COUNT,
  QUESTION_COUNT,
  KNOWLEDGE_DOMAINS,
  loadReviewData,
  pickSession,
  getKnowledgeDomain,
  isPrincipleQuestion,
  scanReadingCodeQuestions,
  getReadingPool,
  isKnowledgeEligible,
  isHandwrittenEligible,
};
