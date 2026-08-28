/**
 * interview 题目扫描用的标题 / 过滤工具
 */

const ALGO_DS_RE =
  /写一下.*算法|实现.*diff|二叉树|图论|动态规划|快排|十大排序|深度搜索|广度搜索|栈、数组、链表|约瑟夫|击鼓传花|扑克牌.*顺子|找出数组|和为[nm]|并发限制.*调度|compareVersion|实现一个flat|版本号.*比较|x个人抱|自然数|最小距离|两数相加|顺子|大文件上传|断点续传|插入.*二叉树/i;

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function normalizeTitle(text) {
  return stripMarkdown(text)
    .replace(/^[0-9]+[\.．、]\s*/, '')
    .replace(/^[问Q][:：]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function isAlgoOrDs(text) {
  return ALGO_DS_RE.test(text);
}

/**
 * 文件名过短或不是问句时，抽题/表格展示用的完整面试问法（key = interview 相对 path）
 */
const INTERVIEW_TITLE_OVERRIDES = {
  'interview/网络/跨域.md': '什么是跨域？同源策略是什么？常见跨域解决方案有哪些？',
  'interview/微前端/微前端的沙箱隔离机制.md': '微前端的沙箱隔离机制是怎么做的？JS / CSS 分别怎么隔离，哪些要自己收？',
  'interview/对比题/ref对比reactive.md': 'ref 和 reactive 有什么区别？',
};

function resolveInterviewTitle(relPath, fileTitle) {
  const normalized = relPath.replace(/\\/g, '/');
  return INTERVIEW_TITLE_OVERRIDES[normalized] || fileTitle;
}

function isCodeTitle(text) {
  const t = stripMarkdown(text).trim();
  if (!t) return true;
  if (/^[a-zA-Z_$][\w$.]*\([^)]*\)$/.test(t)) return true;
  if (/^(console\.|return\s|new\s|typeof\s|instanceof\s)/.test(t)) return true;
  const chinese = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chinese === 0 && /[\(\);={}]/.test(t)) return true;
  if (chinese <= 2 && /^[\w\s.(),'"\-$]+$/.test(t) && /[\(\);]/.test(t)) return true;
  return false;
}

module.exports = {
  INTERVIEW_TITLE_OVERRIDES,
  normalizeTitle,
  resolveInterviewTitle,
  isAlgoOrDs,
  isCodeTitle,
};
