/**
 * 爬取牛客网用户主页面经 → 拆分题目 → 去重写入 25k考察列表
 * 用法: node scrape-nowcoder.js
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const USER_ID = '476088215';
const USER_URL = `https://www.nowcoder.com/users/${USER_ID}`;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(__dirname, 'nowcoder');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 明显不是面经的帖子标题 */
const SKIP_POST_RE = /裁员|晋升|gap|如何才能|最佳策略|专栏|blogCenter/i;

function normKey(title) {
  return title.toLowerCase().replace(/[：:，,。.！!？?（）()【】\[\]「」""''、\-\s]+/g, '');
}

function normalizeTitle(text) {
  return text
    .replace(/#面经#/g, '')
    .replace(/^\d+[\.．、]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function isQuestionLine(line) {
  const t = normalizeTitle(line);
  if (!t || t.length < 2 || t.length > 80) return false;
  if (/^(查看更多|指定圈子|取消|确定|点赞|收藏|评论|#)/.test(t)) return false;
  if (/^阅读题：async$/i.test(t)) return true;
  return /区别|原理|机制|流程|优化|怎么|如何|什么|为什么|eventloop|event loop|fcp|ssr|hook|vue|react|webpack|微前端|qiankun|沙箱|nexttick|computed|watch|middleware|缓存|跨域|闭包|原型|diff|渲染|生命周期|宏任务|微任务|setstate|fiber|redux|typescript|bfc|flex|盒模型|http|tcp|打包|loader|plugin|uniapp|小程序|沙箱|treeshaking|moment|dayjs/i.test(t);
}

function parseQuestionsFromPost(postTitle, content) {
  const seen = new Set();
  const out = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line === postTitle) continue;
    if (SKIP_POST_RE.test(line)) continue;
    if (!isQuestionLine(line)) continue;
    const title = normalizeTitle(line);
    const key = normKey(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

async function collectPostUrls(page) {
  const urls = new Set();
  for (let i = 0; i < 20; i += 1) {
    const batch = await page.evaluate(() =>
      [...document.querySelectorAll('a[href*="/discuss/"], a[href*="/feed/main/detail/"]')]
        .map((a) => a.href || a.getAttribute('href') || '')
        .filter(Boolean),
    );
    for (const href of batch) {
      const url = (href.startsWith('http') ? href : `https://www.nowcoder.com${href}`).split('?')[0];
      if (url.includes('blogCenter')) continue;
      urls.add(url);
    }
    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await sleep(1000);
  }
  return [...urls];
}

async function fetchPost(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(1500);
  return page.evaluate(() => {
    const title = (document.querySelector('h1')?.textContent || document.title || '')
      .replace(/_牛客网.*/, '')
      .trim();
    const el =
      document.querySelector('.post-topic-des') ||
      document.querySelector('[class*="post-content"]') ||
      document.querySelector('[class*="discuss-content"]') ||
      document.querySelector('article');
    const content = (el?.innerText || document.body.innerText || '').slice(0, 30000);
    return { title, content };
  });
}

function loadExistingTitles() {
  const jsonPath = path.join(ROOT, '25k考察列表.json');
  if (!fs.existsSync(jsonPath)) return new Set();
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const keys = new Set();
  for (const q of data.questions || []) {
    keys.add(normKey(q.title));
  }
  return keys;
}

function isDuplicate(title, existing) {
  const key = normKey(title);
  if (existing.has(key)) return true;
  for (const e of existing) {
    if (key.length >= 6 && e.length >= 6 && (key.includes(e) || e.includes(key))) return true;
  }
  return false;
}

/** 简单优先级（对齐简历） */
function classify(title) {
  const t = title.toLowerCase();
  if (/ci\/cd|monorepo|nestjs|埋点|监控|docker|k8s|graphql/i.test(t)) return ['P3', 'P3 冷门'];
  if (/eventloop|event loop|vue3|vue2|react|webpack|微前端|qiankun|缓存|跨域|http|首屏|性能|nexttick|hooks|redux|ssr|中间件|洋葱|koa|egg|闭包|原型|promise|diff|fiber|setstate|typescript/i.test(t)) {
    return ['P0', 'P0 必考'];
  }
  if (/flex|bfc|盒模型|防抖|节流|深拷贝|computed|watch|生命周期|设计模式|vite/i.test(t)) {
    return ['P1', 'P1 高频'];
  }
  return ['P2', 'P2 了解'];
}

function mergeIntoTable(newQuestions) {
  const jsonPath = path.join(ROOT, '25k考察列表.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const existingKeys = new Set((data.questions || []).map((q) => normKey(q.title)));
  let added = 0;

  const emptyReviews = () => ({
    r0: null, r1: null, r2: null, r3: null, r4: null, r5: null, r6: null,
  });

  for (const item of newQuestions) {
    if (isDuplicate(item.title, existingKeys)) continue;
    const [importance, importanceLabel] = classify(item.title);
    const key = normKey(item.title);
    existingKeys.add(key);

    data.questions.push({
      id: `nowcoder/${item.postId}::${key.slice(0, 40)}`,
      title: item.title,
      source: '牛客网面经',
      path: item.postUrl,
      postTitle: item.postTitle,
      firstStudy: null,
      reviews: emptyReviews(),
      order: data.questions.length + 1,
      importance,
      importanceLabel,
      importanceLocked: false,
    });
    added += 1;
  }

  data.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);

  // 同步 md
  require('../.cursor/skills/spaced-review/scripts/sync-table.js');
  return added;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  );

  console.log('1/3 打开主页', USER_URL);
  await page.goto(USER_URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(2000);

  const postUrls = await collectPostUrls(page);
  console.log(`   发现 ${postUrls.length} 条动态链接`);

  const allQuestions = [];
  const posts = [];

  console.log('2/3 抓取帖子正文…');
  for (let i = 0; i < postUrls.length; i += 1) {
    const url = postUrls[i];
    try {
      const { title, content } = await fetchPost(page, url);
      if (SKIP_POST_RE.test(title)) {
        console.log(`   跳过 [${i + 1}] ${title}`);
        continue;
      }
      const postId = url.split('/').pop();
      const qs = parseQuestionsFromPost(title, content);
      if (qs.length === 0) {
        console.log(`   无题目 [${i + 1}] ${title}`);
        continue;
      }
      console.log(`   ✓ [${i + 1}] ${title} → ${qs.length} 题`);
      posts.push({ url, title, content, questions: qs });
      for (const q of qs) {
        allQuestions.push({ title: q, postId, postUrl: url, postTitle: title });
      }
    } catch (err) {
      console.warn(`   失败 [${i + 1}] ${url}:`, err.message);
    }
  }
  await browser.close();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, 'posts-detail.json'),
    `${JSON.stringify({ userId: USER_ID, scrapedAt: new Date().toISOString(), posts }, null, 2)}\n`,
  );

  const existing = loadExistingTitles();
  const unique = allQuestions.filter((q) => !isDuplicate(q.title, existing));
  console.log(`\n3/3 题目：共 ${allQuestions.length} 道，去重后新增 ${unique.length} 道`);

  const added = mergeIntoTable(unique);
  console.log(`\n完成！写入 25k考察列表 ${added} 道（来源：牛客网面经）`);
  console.log('原始数据:', path.join(OUT_DIR, 'posts-detail.json'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
