#!/usr/bin/env node
const { loadData, pickRandomDue, initOrSyncData, getStageDueDate } = require('./lib');

const minArg = process.argv.find((a) => a.startsWith('--min='));
const minImportance = minArg ? minArg.split('=')[1] : undefined;

let data = loadData();
if (!data) data = initOrSyncData();

const { due, notLearned, untested, picked, pickSource } = pickRandomDue(data, undefined, { minImportance });

const dueByImportance = due.reduce((acc, d) => {
  const imp = d.question.importance || 'P2';
  acc[imp] = (acc[imp] || 0) + 1;
  return acc;
}, {});

const summary = {
  totalDue: due.length,
  totalNotLearned: notLearned.length,
  totalUntested: untested.length,
  pickSource,
  dueByImportance,
  dueByStage: due.reduce((acc, d) => {
    acc[d.stageLabel] = (acc[d.stageLabel] || 0) + 1;
    return acc;
  }, {}),
  picked: picked
    ? {
        id: picked.question.id,
        title: picked.question.title,
        importance: picked.question.importance,
        importanceLabel: picked.question.importanceLabel,
        category: picked.question.category,
        path: picked.question.path,
        learned: picked.question.learned,
        learnedLabel: picked.question.learned === 'yes' ? '✓' : picked.question.learned === 'no' ? '✗' : '',
        stageId: picked.stageId,
        stageLabel: picked.stageLabel,
        dueDate: picked.dueDate,
        overdueDays: picked.overdueDays,
        nextDueDate: getStageDueDate(picked.question, picked.stageId),
        pickSource,
      }
    : null,
  allDueIds: due.map((d) => d.question.id),
  notLearnedIds: notLearned.map((d) => d.question.id),
  untestedIds: untested.map((d) => d.question.id),
};

console.log(JSON.stringify(summary, null, 2));
