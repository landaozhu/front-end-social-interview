/**
 * 解析 interview/js/前端面试题汇总.md 中的题目条目
 */
const path = require('path');
const fs = require('fs');
const { normalizeTitle, isAlgoOrDs, isCodeTitle } = require('./parse-compony');
const { shouldExcludeQuestion } = require('./question-filters');

const SUMMARY_FILE = 'interview/js/前端面试题汇总（超全、附答案链接、持续更新中）.md';

function parseSummaryLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>')) return null;

  const linkMatch = trimmed.match(/^[-=]\s*\[([^\]]*)\]\([^)]*\)\s*$/);
  if (linkMatch) {
    const title = normalizeTitle(linkMatch[1]);
    if (!title) return null;
    return title;
  }

  const plainMatch = trimmed.match(/^[-=]\s*(.+)$/);
  if (plainMatch) {
    return normalizeTitle(plainMatch[1]);
  }

  if (/^[-=]/.test(trimmed)) return null;

  const plain = normalizeTitle(trimmed);
  if (plain.length >= 2 && plain.length <= 40 && !plain.includes('http')) {
    return plain;
  }

  return null;
}

function parseInterviewSummary(projectRoot) {
  const filePath = path.join(projectRoot, SUMMARY_FILE);
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const items = [];
  const seen = new Set();

  for (const line of content.split('\n')) {
    const title = parseSummaryLine(line);
    if (!title || title.length < 2) continue;
    if (isAlgoOrDs(title) || isCodeTitle(title)) continue;
    if (/^高性能渲染|^source:/i.test(title)) continue;

    const item = {
      title,
      category: 'summary',
      path: SUMMARY_FILE,
      source: '面试题汇总',
    };
    if (shouldExcludeQuestion(item)) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }

  return items;
}

module.exports = { SUMMARY_FILE, parseInterviewSummary };
