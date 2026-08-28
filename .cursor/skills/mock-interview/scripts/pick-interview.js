#!/usr/bin/env node
const { loadReviewData, pickSession } = require('./lib');

const minArg = process.argv.find((a) => a.startsWith('--min='));
const minImportance = minArg ? minArg.split('=')[1] : undefined;

const data = loadReviewData();
const result = pickSession(data, undefined, { minImportance });

console.log(JSON.stringify(result, null, 2));
