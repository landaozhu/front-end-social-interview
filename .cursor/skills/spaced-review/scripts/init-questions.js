#!/usr/bin/env node
const { initOrSyncData, syncMarkdownTable } = require('./lib');

const data = initOrSyncData();
syncMarkdownTable(data);
console.log(`已同步 ${data.questions.length} 道题目 → data/25k考察列表.json / data/25k考察列表.md`);
