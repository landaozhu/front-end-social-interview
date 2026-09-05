#!/usr/bin/env node
const {
  startSession,
  addAsked,
  loadProgress,
  getArg,
  parseList,
} = require('./lib');

const args = process.argv.slice(2);

if (args.includes('--start')) {
  const progress = startSession({
    company: getArg(args, 'company') || '',
    tier: getArg(args, 'tier') || '',
    round: getArg(args, 'round') || '一面',
    jdKeywords: parseList(getArg(args, 'jd')),
  });
  console.log(JSON.stringify({ ok: true, action: 'start', progress }, null, 2));
  process.exit(0);
}

if (args.includes('--add')) {
  const title = getArg(args, 'title');
  if (!title) {
    console.error('用法: node session.js --add --title="题" --score=7 [--local-id=...] [--source=local|web|invented] [--domain=vue] [--passed=true]');
    process.exit(1);
  }
  const passedArg = getArg(args, 'passed');
  const score = getArg(args, 'score');
  const progress = addAsked({
    title,
    localId: getArg(args, 'local-id'),
    domain: getArg(args, 'domain'),
    source: getArg(args, 'source') || 'invented',
    score: score == null ? null : Number(score),
    passed: passedArg === 'true' || passedArg === '1',
  });
  console.log(JSON.stringify({ ok: true, action: 'add', asked: progress.asked.length }, null, 2));
  process.exit(0);
}

if (args.includes('--clear')) {
  const { saveProgress } = require('./lib');
  saveProgress({
    company: '',
    tier: '',
    round: '一面',
    jdKeywords: [],
    startedAt: null,
    asked: [],
  });
  console.log(JSON.stringify({ ok: true, action: 'clear' }, null, 2));
  process.exit(0);
}

const progress = loadProgress();
console.log(JSON.stringify({ ok: true, action: 'status', progress }, null, 2));
