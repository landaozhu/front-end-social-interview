#!/usr/bin/env node
const { loadData, markResult, syncMarkdownTable, initOrSyncData } = require('./lib');

const questionId = process.argv[2];
const scoreArg = process.argv.find((a) => a.startsWith('--score='));
const score = scoreArg ? Number(scoreArg.split('=')[1]) : 10;

if (!questionId) {
  console.error('用法: node mark-pass.js "<questionId>" [--score=<0-10>]');
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
  passed: result.passed,
  learned: result.learned,
  markedStage: result.stageId ?? null,
  nextStage: result.nextStage ?? null,
}, null, 2));
