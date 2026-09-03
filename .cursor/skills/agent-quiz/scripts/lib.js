const {
  loadData,
  initOrSyncData,
  getDueQuestions,
  getNotLearnedQuestions,
  getUntestedQuestions,
  getPassThreshold,
  pickWithBalancedRatio,
  wasAttemptedToday,
  isRetired,
  todayStr,
} = require('../../spaced-review/scripts/lib');

const QUESTION_COUNT = 3;

const TRACKS = [
  { id: 'principle', label: '原理', test: /\/原理\// },
  { id: 'langchain', label: 'LangChain', test: /\/langchain\// },
  { id: 'python', label: 'Python', test: /\/python\// },
];

function normPath(q) {
  return (q.path || '').replace(/\\/g, '/');
}

function isAgentQuestion(q) {
  const p = normPath(q);
  const haystack = `${p} ${q.title || ''}`;
  if (!p.startsWith('interview/agent/') || !/\.md$/i.test(p)) return false;
  if (/README/i.test(p)) return false;
  if (/langgraph/i.test(haystack)) return false;
  return true;
}

function getTrack(q) {
  const p = normPath(q);
  return TRACKS.find((t) => t.test.test(p)) || { id: 'other', label: '其他' };
}

function buildPools(data, today, filterFn) {
  const skip = (d) => (
    !wasAttemptedToday(d.question, today)
    && !isRetired(d.question)
    && filterFn(d.question)
  );
  return {
    due: getDueQuestions(data, today).filter(skip),
    notLearned: getNotLearnedQuestions(data).filter(skip),
    untested: getUntestedQuestions(data).filter(skip),
  };
}

function toPayload(picked, slot, pickSource, track, filled) {
  const q = picked.question;
  const trackInfo = track || getTrack(q);
  return {
    slot,
    id: q.id,
    title: q.title,
    trackId: trackInfo.id,
    trackLabel: trackInfo.label,
    importance: q.importance,
    importanceLabel: q.importanceLabel,
    path: q.path,
    learned: q.learned,
    learnedLabel: q.learned === 'yes' ? '✓' : q.learned === 'no' ? '✗' : '',
    passThreshold: getPassThreshold(q.importance),
    pickSource,
    filled: Boolean(filled),
    markCommand: `node .cursor/skills/agent-quiz/scripts/mark-question.js "${q.id}" --score=<0-10>`,
  };
}

function pickOne(pools, excludeIds) {
  const filterPool = (items) => items.filter((d) => !excludeIds.has(d.question.id));
  return pickWithBalancedRatio(
    filterPool(pools.due),
    filterPool(pools.notLearned),
    filterPool(pools.untested),
  );
}

function pickSession(data, today = todayStr()) {
  const excludeIds = new Set();
  const questions = [];

  for (const track of TRACKS) {
    if (questions.length >= QUESTION_COUNT) break;
    const pools = buildPools(data, today, (q) => isAgentQuestion(q) && track.test.test(normPath(q)));
    const { picked, pickSource } = pickOne(pools, excludeIds);
    if (!picked) continue;
    excludeIds.add(picked.question.id);
    questions.push(toPayload(picked, questions.length + 1, pickSource, track, false));
  }

  while (questions.length < QUESTION_COUNT) {
    const pools = buildPools(data, today, isAgentQuestion);
    const { picked, pickSource } = pickOne(pools, excludeIds);
    if (!picked) break;
    excludeIds.add(picked.question.id);
    questions.push(toPayload(picked, questions.length + 1, pickSource, null, true));
  }

  const due = getDueQuestions(data, today).filter((d) => isAgentQuestion(d.question));
  const notLearned = getNotLearnedQuestions(data).filter((d) => isAgentQuestion(d.question));
  const untested = getUntestedQuestions(data).filter((d) => isAgentQuestion(d.question));

  return {
    session: {
      type: 'Agent 自测',
      questionCount: questions.length,
      target: QUESTION_COUNT,
      tracks: questions.map((q) => q.trackLabel),
      coverageComplete: TRACKS.every((t) => questions.some((q) => q.trackId === t.id)),
    },
    dueStats: {
      totalDue: due.filter((d) => !wasAttemptedToday(d.question, today) && !isRetired(d.question)).length,
      totalNotLearned: notLearned.filter((d) => !wasAttemptedToday(d.question, today) && !isRetired(d.question)).length,
      totalUntested: untested.filter((d) => !wasAttemptedToday(d.question, today) && !isRetired(d.question)).length,
    },
    questions,
    note: '每天 3 题：原理 / LangChain / Python 尽量各 1。不要把后续题目提前告诉候选人。禁止 LangGraph。',
  };
}

function loadReviewData() {
  let data = loadData();
  if (!data) data = initOrSyncData();
  return data;
}

module.exports = {
  QUESTION_COUNT,
  TRACKS,
  isAgentQuestion,
  getTrack,
  loadReviewData,
  pickSession,
};
