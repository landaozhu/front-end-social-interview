#!/usr/bin/env node
const { loadData, initOrSyncData, pickUnlocked, rememberPicked, getStageDueDate } = require('./lib');

let data = loadData();
if (!data) data = initOrSyncData();

const { due, forgotten, notLearned, picked, pickSource } = pickUnlocked(data);

if (picked) rememberPicked(data, picked.question.id);

const dueByImportance = due.reduce((acc, d) => {
  const imp = d.question.importance || 'P2';
  acc[imp] = (acc[imp] || 0) + 1;
  return acc;
}, {});

const summary = {
  totalDue: due.length,
  totalForgotten: (forgotten || []).length,
  totalNotLearned: (notLearned || []).length,
  pickSource,
  dueByImportance,
  dueByStage: due.reduce((acc, d) => {
    acc[d.stageLabel] = (acc[d.stageLabel] || 0) + 1;
    return acc;
  }, {}),
  picked: picked
    ? {
        id: picked.question.id,
        fid: picked.question.fid,
        title: picked.question.title,
        displayTitle: picked.question.displayTitle,
        difficultyLabel: picked.question.difficultyLabel,
        path: picked.question.path,
        learnedLabel: picked.question.forgottenAt
          ? '✓ 遗忘'
          : picked.question.learned === 'yes' ? '✓' : picked.question.learned === 'no' ? '✗' : '',
        forgotten: Boolean(picked.question.forgottenAt),
        lapseCount: picked.question.lapseCount || 0,
        stageId: picked.stageId,
        stageLabel: picked.stageLabel,
        dueDate: picked.dueDate,
        nextDueDate: getStageDueDate(picked.question, picked.stageId),
        pickSource,
      }
    : null,
};

console.log(JSON.stringify(summary, null, 2));
