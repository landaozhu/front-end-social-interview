#!/usr/bin/env node
const { loadReviewData, matchTopics, getArg, parseList } = require('./lib');

const args = process.argv.slice(2);
const topics = parseList(getArg(args, 'topics'));
if (topics.length === 0) {
  console.error('用法: node match-topics.js --topics=xss,typescript,fiber');
  process.exit(1);
}

const data = loadReviewData();
const matches = matchTopics(data, topics);
console.log(JSON.stringify({ topics, count: matches.length, matches }, null, 2));
