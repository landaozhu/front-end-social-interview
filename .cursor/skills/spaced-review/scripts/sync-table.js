#!/usr/bin/env node
const { loadData, syncMarkdownTable, initOrSyncData, saveData } = require('./lib');

let data = loadData();
if (!data) data = initOrSyncData();
syncMarkdownTable(data);
saveData(data);
console.log('已同步 data/25k考察列表.json / data/25k考察列表.md');
