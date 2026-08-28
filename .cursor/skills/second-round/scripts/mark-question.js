#!/usr/bin/env node
const { markQuestion } = require('./lib');

const args = process.argv.slice(2);
const questionId = args.find((a) => !a.startsWith('--'));
const scoreArg = args.find((a) => a.startsWith('--score='));

if (!questionId || !scoreArg) {
  console.error('用法: node mark-question.js "<questionId>" --score=<0-10>');
  process.exit(1);
}

const score = Number(scoreArg.split('=')[1]);

try {
  const result = markQuestion(questionId, score);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
