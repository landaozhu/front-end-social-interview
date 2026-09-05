#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const questionId = args.find((a) => !a.startsWith('--'));
const scoreArg = args.find((a) => a.startsWith('--score='));

if (!questionId || !scoreArg) {
  console.error('用法: node mark-question.js "<questionId>" --score=<0-10>');
  process.exit(1);
}

const markResultScript = path.resolve(__dirname, '../../spaced-review/scripts/mark-result.js');
const result = spawnSync('node', [markResultScript, questionId, scoreArg], {
  encoding: 'utf8',
  cwd: path.resolve(__dirname, '../../../..'),
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
