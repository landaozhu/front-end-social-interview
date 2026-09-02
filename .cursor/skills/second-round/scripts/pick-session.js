#!/usr/bin/env node
const { pickSession } = require('./lib');

const args = process.argv.slice(2);
const modeArg = args.find((a) => a.startsWith('--mode='));
const clusterArg = args.find((a) => a.startsWith('--cluster='));

const result = pickSession({
  mode: modeArg ? modeArg.split('=')[1] : 'full',
  cluster: clusterArg ? clusterArg.split('=')[1] : undefined,
});

console.log(JSON.stringify(result, null, 2));
