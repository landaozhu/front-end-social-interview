/**
 * 从牛客网面经帖子内容拆分面试题
 */
const {
  normalizeTitle,
  isAlgoOrDs,
  isCodeTitle,
  looksLikeFrontendQuestion,
} = require('./parse-compony');

const NOISE_RE =
  /^(#面经#|#前端#|查看更多|指定圈子|取消|确定|一条动态|点赞|收藏|评论|转发|关注|举报|登录|注册)$/i;

const HR_RE =
  /^(自我介绍|作者：|链接：|来源：|gap|裁员|晋升|面试者基本情况|工作与技术栈背景)/;

function isNowcoderNoise(line) {
  const t = line.trim().replace(/\u00a0/g, ' ');
  if (!t || t.length < 2) return true;
  if (/^[-*•–—]\s/.test(t)) return true;
  if (NOISE_RE.test(t)) return true;
  if (HR_RE.test(t)) return true;
  if (/^被裁员|^当我想晋升|^在如此艰难|^大厂\s+阿里云/.test(t)) return true;
  if (/牛客在手|offer不愁/.test(t)) return true;
  if (/^\*\*/.test(t)) return true;
  return false;
}

function parseNowcoderPostContent(postTitle, content) {
  const items = [];
  const seen = new Set();
  const lines = content.split('\n');

  for (const raw of lines) {
    let line = raw.trim().replace(/#面经#/g, '').trim();
    if (isNowcoderNoise(line)) continue;
    if (line === postTitle) continue;

    const title = normalizeTitle(line);
    if (!title || title.length < 2 || title.length > 80) continue;
    if (isAlgoOrDs(title) || isCodeTitle(title)) continue;
    if (/阅读题：/i.test(title) && title.length < 8) continue;

    const ok =
      looksLikeFrontendQuestion(title) ||
      /区别|原理|机制|流程|优化|eventloop|event loop|fcp|ssr|hook|vue|react|webpack|微前端|沙箱|nexttick|computed|watch|middleware|缓存|跨域|闭包|原型|diff|渲染|生命周期|宏任务|微任务|uniapp|uni-app|useMemo|useCallback|网络攻击|package\.json|lock|decimal|decical|enum|interface|灰度|小程序/i.test(
        title,
      );

    if (!ok) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(title);
  }

  return items;
}

function parseNowcoderPosts(posts) {
  const results = [];
  const seen = new Set();

  for (const post of posts) {
    const titles = parseNowcoderPostContent(post.title, post.content);
    const postId = post.url.replace(/.*\/(discuss|detail)\/([^/?]+).*/, '$2');

    for (const title of titles) {
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        title,
        category: 'nowcoder',
        path: `nowcoder/${postId}`,
        source: '牛客网面经',
        postTitle: post.title,
        postUrl: post.url,
      });
    }
  }

  return results;
}

module.exports = { parseNowcoderPostContent, parseNowcoderPosts };
