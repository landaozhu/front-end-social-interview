#!/usr/bin/env node
const { initOrSyncData, syncMarkdownTable } = require('./lib');

const data = initOrSyncData();
syncMarkdownTable(data);

const learned = data.questions.filter((q) => q.learned === 'yes').length;
const notLearned = data.questions.filter((q) => q.learned === 'no').length;
const untested = data.questions.filter((q) => q.learned !== 'yes' && q.learned !== 'no').length;
const unlocked = data.questions.filter((q) => q.unlocked).length;

console.log(JSON.stringify({
  ok: true,
  total: data.questions.length,
  unlocked,
  learned,
  notLearned,
  untested,
  updatedAt: data.updatedAt,
}, null, 2));
