/**
 * 从 compony/*.md 面经中拆分单道前端面试题
 */

const ALGO_DS_RE =
  /写一下.*算法|实现.*diff|讨论了一下我写的diff|说说react diff|分享屏幕|leetcode|二叉树|图论|动态规划|快排|十大排序|深度搜索|广度搜索|栈、数组、链表|约瑟夫|击鼓传花|扑克牌.*顺子|找出数组|和为[nm]|海量日志|智力题|二进制加法|并发限制.*调度|compareVersion|实现一个flat|版本号.*比较|x个人抱|自然数|最小距离|单词及出现次数|输入框输入值后.*数组内找|两数相加|顺子|大文件上传|断点续传|插入.*二叉树/i;

const HR_META_RE =
  /^(自我介绍|作者：|链接：|来源：|很久以前|失败原因|感谢面试官|口头offer|考不考研|有没有女朋友|还有什么在流程|实习的情况|想问什么|唠嗑|插曲|表现贼差|希望能过|我爱腾讯|感谢腾讯|一面的情况|分享屏幕|专业及主修|编译原理|操作系统|我怀疑我进错了|平时怎么学习|有没有加入什么社团|三个词形容|近几年职业规划|你有啥职业|兴趣爱好|没做出来|讲了个大概|附加题|没答上来|有点忘了|当初面的时候|结果等了一个星期|心态已经|随便说了个答案|职业规划|见本博客)/;

const FE_TOPIC_RE =
  /vue|react|webpack|vite|css|html|http|https|tcp|udp|dns|跨域|闭包|原型|event\s?loop|事件循环|浏览器|渲染|dom|flex|bfc|盒模型|position|节流|防抖|promise|async|await|hooks|生命周期|虚拟dom|diff|vuex|redux|middleware|中间件|洋葱|koa|node|npm|babel|loader|缓存|cookie|session|xss|csrf|网络攻击|seo|spa|ssr|typescript|语义化|重排|重绘|回流|cors|jsonp|性能优化|首屏|cdn|雪碧图|移动端|像素|rem|viewport|call|apply|bind|继承|组件通信|slot|mixin|computed|watch|nexttick|响应式|proxy|composition|fiber|setstate|useeffect|usememo|usecallback|微前端|iframe|monorepo|ci\/cd|监控|埋点|nest|websocket|etag|fastclick|垂直居中|圣杯|双飞翼|懒加载|预加载|transform|less|sass|postcss|hmr|tree\s?shaking|this指向|this的|原型链|uni-?app|小程序|灰度|package\.json|lockfile|decimal|enum|interface/i;

const NARRATIVE_NOISE_RE =
  /以为|之后|谷歌|可能会|比较容易|详细的|参考$|一面$|WXG|失败原因|蒙圈|脱口而出|以讹传讹|Performance|encoding|预解析|构建过程|串行还是并行|其实|但其实|比较容易混淆/;

const CODE_LINE_RE =
  /^[\s]*(\/\/|\/\*|console\.|function |const |let |var |import |export |class |return |if \(|for \(|while \(|=>|\}|\{|<!DOCTYPE|<script|<\/script|\.then\(|Promise\.|async function|setTimeout|document\.|window\.|result\[)/i;

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

function isHrMeta(text) {
  return HR_META_RE.test(text.trim());
}

/** 中英混写的对比题（useMemo跟useCallback）不要当代码 */
function isMixedTopicTitle(text) {
  return /[\u4e00-\u9fff]/.test(text) && /跟|和|区别|原理|怎么|为何|对比|机制|流程/.test(text);
}

/** 题干本身是代码片段，不能作为面试题 */
function isCodeTitle(text) {
  const t = stripMarkdown(text).trim();
  if (!t) return true;
  if (isMixedTopicTitle(t)) return false;
  if (/^[a-zA-Z_$][\w$.]*\([^)]*\)$/.test(t)) return true;
  if (/^(console\.|return\s|new\s|typeof\s|instanceof\s)/.test(t)) return true;
  const chinese = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chinese === 0 && /[\(\);={}]/.test(t)) return true;
  if (chinese <= 2 && /^[\w\s.(),'"\-$]+$/.test(t) && /[\(\);]/.test(t)) return true;
  return false;
}

function isCodeLike(text) {
  if (isMixedTopicTitle(text)) return false;
  if (CODE_LINE_RE.test(text.trim())) return true;
  if (isCodeTitle(text)) return true;
  if (/\w+\([^)]*\)/.test(text) && !/[？?]$/.test(text)) return true;
  if (/^this[\[.]|^return\s|^fn\.|^isUrl\(/.test(text.trim())) return true;
  if (/[=<>{}[\]'"]/.test(text) && !/[？?]$/.test(text)) return true;
  if (/^async\d|^await\s+\w+$/.test(text.trim())) return true;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  return letters > text.length * 0.55;
}

function looksLikeFrontendQuestion(text) {
  const t = stripMarkdown(text);
  if (t.length < 4 || t.length > 80) return false;
  if (isAlgoOrDs(t) || isHrMeta(t) || isCodeLike(t)) return false;
  if (/^[#>`\-|<]/.test(t)) return false;
  if (/[{};]|<\/?[a-z]|^\.\w|::|--\w|fn\.|return this|getAge|setAge|isUrl\(/.test(t)) return false;
  if (/[。，；;]/.test(t)) return false;
  if (/求饶|\.\.\./.test(t)) return false;
  if (NARRATIVE_NOISE_RE.test(t)) return false;
  if (/^(一面|二面|三面|四面|HR面|电话面|视频面)/.test(t)) return false;
  if (FE_TOPIC_RE.test(t)) return true;
  if (/[？?]$/.test(t)) return true;
  if (/^(问|讲一讲|为什么|怎么|如何|什么是|说说|描述|解释|实现私)/.test(t)) return true;
  return false;
}

function extractInterviewLink(text) {
  const m = text.match(/\]\((?:\.\.\/)?(interview\/[^)]+\.md)\)/i);
  return m ? m[1] : null;
}

function parseTableKnowledge(content) {
  const rows = [];

  // TSV（速境生活科技.md）
  if (content.includes('知识点') && content.includes('\t')) {
    for (const line of content.split('\n')) {
      if (!line.includes('\t') || line.startsWith('优先级')) continue;
      const cols = line.split('\t').map((c) => c.trim());
      if (cols.length >= 2 && /^🔴|^🟠|^🟡/.test(cols[0])) {
        const topic = cols[1];
        if (topic && !isAlgoOrDs(topic)) rows.push(topic);
      }
    }
    if (rows.length) return rows;
  }

  // Markdown 表格
  for (const line of content.split('\n')) {
    if (!line.includes('|') || line.includes('---')) continue;
    const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols[0] === '优先级' || cols.includes('知识点')) continue;
    if (cols.length >= 2 && /^🔴|^🟠|^🟡/.test(cols[0])) {
      const topic = cols[1];
      if (topic && !isAlgoOrDs(topic)) rows.push(topic);
    }
  }
  return rows;
}

function parseNumberedList(content) {
  const items = [];
  let inCode = false;
  const re = /^[0-9]+[\.．、]\s*(.+)$/gm;
  for (const raw of content.split('\n')) {
    if (raw.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^[0-9]+[\.．、]\s*(.+)$/.exec(raw.trim());
    if (m) items.push(m[1].trim());
  }
  return items;
}

/** 面经条目式：每行一题（duandian 风格） */
function parseShortLineList(content) {
  const items = [];
  let inCode = false;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line || /[{;<>]/.test(line)) continue;
    if (line.startsWith('#') || line.startsWith('作者') || line.startsWith('链接')) continue;
    if (looksLikeFrontendQuestion(line)) items.push(line);
  }
  return items;
}

/** 叙事面经中的独立短题干（无问号） */
function parseStandaloneTopics(content) {
  const items = [];
  let inCode = false;
  for (const raw of content.split('\n')) {
    let line = raw.trim().replace(/[。．]$/, '').replace(/参考$/, '').trim();
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line) continue;
    if (/[{;<>]/.test(line) || line.includes('。') || line.includes('...')) continue;
    if (line.length < 6 || line.length > 35) continue;
    if (/[，；：""''（【]/.test(line)) continue;
    if (NARRATIVE_NOISE_RE.test(line) || isHrMeta(line)) continue;
    if (FE_TOPIC_RE.test(line) || /^(讲一讲|说说|介绍|实现私)/.test(line)) {
      items.push(line);
    }
  }
  return items;
}

/** 叙事面经：仅提取明确的问句 */
function parseExplicitQuestions(content) {
  const items = [];
  let inCode = false;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line || line.length > 55) continue;
    if (!/[？?]$/.test(line)) continue;
    if (NARRATIVE_NOISE_RE.test(line) || isAlgoOrDs(line) || isHrMeta(line) || isCodeLike(line)) {
      continue;
    }
    if (/[，。]/.test(line.replace(/[？?]$/, ''))) continue;
    if (FE_TOPIC_RE.test(line) || /^问[：:]/.test(line)) {
      items.push(line);
    }
  }
  return items;
}

function finalize(rawList, relPath) {
  const seen = new Set();
  const results = [];

  for (const raw of rawList) {
    const title = normalizeTitle(raw);
    if (!title || title.length < 4) continue;
    if (isAlgoOrDs(title) || isHrMeta(title) || isCodeTitle(title)) continue;
    if (/也有|便于|友好|未加载时/.test(title) && !/[？?]$/.test(title)) continue;
    if (/^async\d|^await\s+[A-Z]\(\)/.test(title)) continue;
    if (!looksLikeFrontendQuestion(title) && !FE_TOPIC_RE.test(title)) continue;
    if (extractInterviewLink(raw)) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      title,
      category: relPath.split('/').slice(0, -1).join('/') || 'compony',
      path: relPath,
      source: 'compony',
      raw,
    });
  }

  return results;
}

function parseComponyMarkdown(relPath, content) {
  if (content.includes('知识点') && (content.includes('|') || content.includes('\t'))) {
    return finalize(parseTableKnowledge(content), relPath);
  }

  const numbered = parseNumberedList(content);
  const validNumbered = numbered.filter((raw) => {
    const t = normalizeTitle(raw);
    return t && !isAlgoOrDs(t) && (looksLikeFrontendQuestion(t) || FE_TOPIC_RE.test(t));
  });
  if (validNumbered.length >= 3) {
    return finalize(validNumbered, relPath);
  }

  const shortLines = parseShortLineList(content);
  const hasHtmlOrCode = /<[a-z!/]|function\s+\w+\s*\(/.test(content);
  const nonEmpty = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('```'));
  const avgLen =
    nonEmpty.reduce((s, l) => s + l.trim().length, 0) / (nonEmpty.length || 1);

  if (!hasHtmlOrCode && shortLines.length >= 10 && avgLen < 35) {
    return finalize(shortLines, relPath);
  }

  return finalize(
    [...parseStandaloneTopics(content), ...parseExplicitQuestions(content)],
    relPath,
  );
}

module.exports = {
  parseComponyMarkdown,
  normalizeTitle,
  isAlgoOrDs,
  isCodeTitle,
  looksLikeFrontendQuestion,
};
