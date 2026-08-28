const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const USER_ID = '325111174666471';
const BASE = path.join(__dirname, '..', 'interview');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function fetchArticleList() {
  const articles = [];
  let cursor = '0';
  while (true) {
    const res = await fetch('https://api.juejin.cn/content_api/v1/article/query_list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://juejin.cn' },
      body: JSON.stringify({ user_id: USER_ID, sort_type: 2, cursor }),
    });
    const data = await res.json();
    if (data.err_no !== 0) throw new Error(data.err_msg);
    articles.push(...(data.data || []));
    if (!data.has_more) break;
    cursor = String(parseInt(cursor, 10) + 10);
  }
  return articles;
}

function normalize(s) {
  return s.toLowerCase().replace(/[：:，,。.！!？?（）()【】\[\]「」""''、\-\s]+/g, '');
}

function getExistingFiles() {
  const existing = new Map();
  function walk(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.md$/i.test(f.name)) {
        const name = f.name.replace(/\.md$/i, '');
        existing.set(normalize(name), p);
      }
    }
  }
  walk(BASE);
  return existing;
}

function isSimilar(title, existing) {
  const nt = normalize(title);
  for (const [ne, p] of existing) {
    if (nt === ne) return { match: true, path: p };
    const minLen = Math.min(nt.length, ne.length);
    if (minLen >= 2 && (nt.includes(ne) || ne.includes(nt))) {
      return { match: true, path: p };
    }
    // 去掉常见前缀再比（如 React、Vue、H5）
    const stripped = nt.replace(/^(react|vue|h5|html|css|js)/, '');
    const neStripped = ne.replace(/^(react|vue|h5|html|css|js)/, '');
    if (stripped.length >= 2 && neStripped.length >= 2 && stripped === neStripped) {
      return { match: true, path: p };
    }
  }
  return { match: false };
}

function getFolder(title, tags) {
  const t = title.toLowerCase();
  const tagNames = (tags || []).map((x) => x.tag_name || '').join(' ');
  const combined = t + ' ' + tagNames;

  if (/react|hook|jsx/.test(combined)) return 'react';
  if (/vue|composition/.test(combined)) return 'vue';
  if (/css|bfc|盒模型|flex|伪类|重排|重绘|0\.5px/.test(combined)) return 'css';
  if (/html|语义化|h5/.test(combined)) return 'html';
  if (/http|缓存|跨域|tcp|dns/.test(combined)) return '网络';
  if (/webpack|vite|打包/.test(combined)) return 'webpack';
  if (/node|koa|egg|中间件/.test(combined)) return 'node';
  if (/算法|排序|快排|递归|动态规划/.test(combined)) return 'algorithm';
  if (/数据结构|二叉|链表|栈|队列|堆/.test(combined)) return 'dataStructure';
  if (/typescript|ts/.test(combined)) return 'ts';
  if (/深拷贝|防抖|节流|promise|call|bind|ajax|手写|并发|可选链|观察者|localstorage|设计模式/.test(combined)) return 'handwritten';
  if (/面试题|面试官|字节|百度|猫眼|百姓网/.test(combined)) return 'js';
  if (/git/.test(combined)) return 'js';
  if (/小程序|微信/.test(combined)) return 'js';
  if (/skill|sop|习惯|harness|cursor|xlsx|react-quill/.test(combined)) return '优化';
  return 'js';
}

function safeFilename(title) {
  return title.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
}

async function scrapeArticle(page, articleId) {
  const url = `https://juejin.cn/post/${articleId}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#article-root, .article-content, .markdown-body', { timeout: 30000 }).catch(() => {});

  const result = await page.evaluate(() => {
    const root = document.querySelector('#article-root') || document.querySelector('.article-content');
    if (!root) return { title: '', markdown: '' };

    const title = document.querySelector('h1')?.innerText?.trim() || '';
    const clone = root.cloneNode(true);

    clone.querySelectorAll('script, style').forEach((el) => el.remove());

    function toMd(el) {
      if (el.nodeType === 3) return el.textContent;
      if (!el.tagName) return '';
      const tag = el.tagName.toLowerCase();
      const children = [...el.childNodes].map(toMd).join('');

      if (tag === 'h1') return `\n# ${children.trim()}\n\n`;
      if (tag === 'h2') return `\n## ${children.trim()}\n\n`;
      if (tag === 'h3') return `\n### ${children.trim()}\n\n`;
      if (tag === 'h4') return `\n#### ${children.trim()}\n\n`;
      if (tag === 'p') return `${children.trim()}\n\n`;
      if (tag === 'br') return '\n';
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'code' && el.parentElement?.tagName !== 'PRE') return `\`${children}\``;
      if (tag === 'pre') {
        const code = el.querySelector('code');
        const lang = (code?.className || '').replace('language-', '') || '';
        const text = code?.innerText || el.innerText || '';
        return `\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`;
      }
      if (tag === 'a') return `[${children}](${el.href || ''})`;
      if (tag === 'img') return `\n![${el.alt || ''}](${el.src || ''})\n`;
      if (tag === 'li') return `- ${children.trim()}\n`;
      if (tag === 'ul' || tag === 'ol') return `\n${children}\n`;
      if (tag === 'blockquote') return `> ${children.trim()}\n\n`;
      if (tag === 'hr') return '\n---\n\n';
      return children;
    }

    return { title, markdown: toMd(clone).trim() };
  });

  return result;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const limit = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '999', 10);

  console.log('Fetching article list...');
  const articles = await fetchArticleList();
  console.log(`Found ${articles.length} articles`);

  const existing = getExistingFiles();
  const toDownload = [];

  for (const a of articles) {
    const info = a.article_info;
    const { match, path: matchPath } = isSimilar(info.title, existing);
    if (match) {
      console.log(`SKIP (exists): ${info.title} -> ${matchPath}`);
    } else {
      toDownload.push(a);
    }
  }

  console.log(`\nNeed to download: ${toDownload.length} articles`);
  if (dryRun) {
    toDownload.slice(0, limit).forEach((a) => console.log(`  - ${a.article_info.title}`));
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  let saved = 0;
  for (const a of toDownload.slice(0, limit)) {
    const info = a.article_info;
    const id = info.article_id;
    console.log(`\nScraping: ${info.title} (${id})`);

    try {
      const { title, markdown } = await scrapeArticle(page, id);
      if (!markdown || markdown.length < 50) {
        console.log(`  WARN: content too short (${markdown?.length || 0} chars), skipping`);
        continue;
      }

      const folder = getFolder(info.title, a.tags);
      const dir = path.join(BASE, folder);
      fs.mkdirSync(dir, { recursive: true });

      const filename = safeFilename(info.title) + '.md';
      const filepath = path.join(dir, filename);

      const header = `# ${title || info.title}\n\n> 来源: https://juejin.cn/post/${id}\n\n`;
      fs.writeFileSync(filepath, header + markdown, 'utf8');
      console.log(`  Saved: ${filepath} (${markdown.length} chars)`);
      saved++;
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  await browser.close();
  console.log(`\nDone! Saved ${saved} articles.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
