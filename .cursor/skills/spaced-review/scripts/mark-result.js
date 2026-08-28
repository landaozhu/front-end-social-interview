#!/usr/bin/env node
const { loadData, markResult, syncMarkdownTable, initOrSyncData } = require('./lib');

const questionId = process.argv[2];
const scoreArg = process.argv.find((a) => a.startsWith('--score='));

if (!questionId || !scoreArg) {
  console.error('用法: node mark-result.js "<questionId>" --score=<0-10>');
  process.exit(1);
}

const score = Number(scoreArg.split('=')[1]);
if (Number.isNaN(score) || score < 0 || score > 10) {
  console.error('score 必须是 0～10 的数字');
  process.exit(1);
}

let data = loadData();
if (!data) data = initOrSyncData();

const result = markResult(data, questionId, score);
syncMarkdownTable(data);

console.log(JSON.stringify({
  ok: true,
  title: result.question.title,
  score: result.score,
  threshold: result.threshold,
  passed: result.passed,
  learned: result.learned,
  learnedLabel: result.passed ? '✓' : '✗',
  stageId: result.stageId ?? null,
  nextStage: result.nextStage ?? null,
  firstLearnedAt: result.question.firstLearnedAt,
}, null, 2));
