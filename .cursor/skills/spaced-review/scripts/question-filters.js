/**
 * 剔除：追问子题、教程/文章（非独立面试题）
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

/** 子目录下的追问：只保留主题目文件，其余剔除 */
const FOLLOWUP_DIRS = {
  'interview/网络/url过程': ['url输入到页面展示的过程.md'],
  'interview/dataStructure/tree': [],
  'interview/es5/this': [],
};

/** 整目录排除（非面试题集合） */
const EXCLUDE_DIRS = new Set(['优化', '场景题']);

/** 文件名 / 标题：文章、教程、笔记，非独立面试题 */
const ARTICLE_TITLE_RE =
  /快速入门|入门（|教程|指南|第一次看|应该从哪个文件|从源码了解|总结出的|skill|SOP|harness|xlsx|react-quill|jquery源码|属性合集|面试题汇总|高频.*面试题|练习题|原理分析-|git 进阶|被面试官嫌弃基础不扎实|前端开发自测|专业度，我养成|效率就大幅度|使用xlsx|组件之间传参|截屏|\.vue$/i;

/** 路径片段：掘金长文 / 工作笔记类 */
const ARTICLE_PATH_RE =
  /\/优化\/|\/场景题\/|jquery源码|react15\.6\.2|react-quill|微信小程序|第一次看 Vue2|skill\.md|SOP\.md|harness|xlsx/i;

/** 追问子题 / 面经变体：已有母题覆盖，不再单独抽 */
const EXCLUDE_PATH_RE = /interview\/网络\/为什么跨域要发送options请求\.md$/;
const EXCLUDE_TITLE_RE = /复杂请求为什么发送options|为什么跨域要发送options/i;

function isFollowUpSubtopic(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  for (const [dir, keepFiles] of Object.entries(FOLLOWUP_DIRS)) {
    if (!normalized.startsWith(`${dir}/`)) continue;
    const filename = path.basename(normalized);
    if (keepFiles.includes(filename)) return false;
    return true;
  }
  return false;
}

function isExcludedDir(categoryParts) {
  return categoryParts.some((p) => EXCLUDE_DIRS.has(p));
}

const SUMMARY_FILE = 'interview/js/前端面试题汇总（超全、附答案链接、持续更新中）.md';

function isArticleNotQuestion(item) {
  const { title = '', path: relPath = '' } = item;
  if (relPath.replace(/\\/g, '/') === SUMMARY_FILE) return false;
  const combined = `${title} ${relPath}`;

  if (ARTICLE_TITLE_RE.test(combined)) return true;
  if (ARTICLE_PATH_RE.test(relPath)) return true;

  // 掘金爬取的教程文（含 markdown-body 样式块 + 快速入门类导语）
  if (relPath.startsWith('interview/')) {
    try {
      const full = path.join(PROJECT_ROOT, relPath);
      if (fs.existsSync(full)) {
        const head = fs.readFileSync(full, 'utf8').slice(0, 2000);
        if (head.includes('.markdown-body{') && /快速入门|梳理一篇|旨在帮助/.test(head)) {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }

  return false;
}

function isAgentTrack(item) {
  const relPath = (item.path || '').replace(/\\/g, '/');
  return relPath.startsWith('interview/agent/');
}

function shouldExcludeQuestion(item) {
  const relPath = (item.path || '').replace(/\\/g, '/');
  const combined = `${item.title || ''} ${relPath}`;

  if (isFollowUpSubtopic(relPath)) return true;
  if (EXCLUDE_PATH_RE.test(relPath)) return true;
  if (EXCLUDE_TITLE_RE.test(combined)) return true;
  if (isArticleNotQuestion(item)) return true;

  const parts = relPath.split('/');
  if (parts[0] === 'interview' && isExcludedDir(parts.slice(1, -1))) {
    return true;
  }

  return false;
}

module.exports = {
  FOLLOWUP_DIRS,
  isFollowUpSubtopic,
  isArticleNotQuestion,
  isAgentTrack,
  shouldExcludeQuestion,
};
