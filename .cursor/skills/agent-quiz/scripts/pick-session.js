#!/usr/bin/env node
const { loadReviewData, pickSession } = require('./lib');

const data = loadReviewData();
const result = pickSession(data);
console.log(JSON.stringify(result, null, 2));
