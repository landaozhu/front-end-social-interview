#!/usr/bin/env node
const { pickAlgorithmQuestion } = require('./lib');

const freqArg = process.argv.find((a) => a.startsWith('--frequency='));
const frequency = freqArg ? freqArg.split('=')[1] : undefined;

const result = pickAlgorithmQuestion({ frequency });
console.log(JSON.stringify(result, null, 2));
