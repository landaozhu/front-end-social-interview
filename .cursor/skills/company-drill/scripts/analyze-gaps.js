#!/usr/bin/env node
const { loadReviewData, analyzeGaps, getArg } = require('./lib');

const args = process.argv.slice(2);
const data = loadReviewData();
const result = analyzeGaps(data, {
  boost: getArg(args, 'boost'),
  skip: getArg(args, 'skip'),
  includeAgent: args.includes('--include-agent'),
});

console.log(JSON.stringify(result, null, 2));
