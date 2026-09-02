#!/usr/bin/env node
const {
  loadData,
  markPlatformPass,
  markPlatformFail,
  markPlatformRetire,
  syncMarkdownTable,
  initOrSyncData,
} = require('./lib');

const args = process.argv.slice(2);
const isFail = args.includes('--fail');
const isRetire = args.includes('--retire');
const query = args.filter((a) => !a.startsWith('--')).join(' ').trim() || null;

if (!isFail && !isRetire && !args.includes('--pass') && !query) {
  console.error('用法: node mark-result.js --pass [题名]\n      node mark-result.js --fail [题名]\n      node mark-result.js --retire [题名]\n省略题名则更新上次抽到的题');
  process.exit(1);
}

let data = loadData();
if (!data) data = initOrSyncData();

const result = isRetire
  ? markPlatformRetire(data, query)
  : isFail
    ? markPlatformFail(data, query)
    : markPlatformPass(data, query);

syncMarkdownTable(data);

console.log(JSON.stringify({
  ok: true,
  title: result.question.title,
  displayTitle: result.question.displayTitle,
  passed: result.passed ?? null,
  retired: Boolean(result.retired || result.question.retired),
  learned: result.learned ?? result.question.learned,
  learnedLabel: result.retired
    ? '不再提问'
    : result.passed ? '✓' : (result.forgotten ? '✓ 遗忘' : '✗'),
  forgotten: Boolean(result.forgotten),
  lapseCount: result.lapseCount || result.question.lapseCount || 0,
  stageId: result.stageId ?? null,
  nextStage: result.nextStage ?? null,
  firstLearnedAt: result.question.firstLearnedAt,
  path: result.question.path,
}, null, 2));
