const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = path.join(__dirname, '..', 'interview');
const USER_ID = '325111174666471';

const WANT_KEYWORDS = [
  'react15.6.2',
  '微信小程序',
  'composition-api',
  '设计模式面试',
  '数据结构面试',
  '算法面试',
  '被面试官嫌弃',
];

async function fetchAllArticles() {
  const all = [];
  let cursor = '0';
  while (true) {
    const res = await fetch('https://api.juejin.cn/content_api/v1/article/query_list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER_ID, sort_type: 2, cursor }),
    });
    const data = await res.json();
    all.push(...(data.data || []));
    if (!data.has_more) break;
    cursor = String(parseInt(cursor, 10) + 10);
  }
  return all;
}

function getFolder(title) {
  if (/react15/i.test(title)) return 'react';
  if (/微信/.test(title)) return 'js';
  if (/composition/.test(title)) return 'vue';
  if (/设计模式/.test(title)) return 'js';
  if (/数据结构/.test(title)) return 'dataStructure';
  if (/算法/.test(title)) return 'algorithm';
  return 'js';
}

async function scrapeArticle(page, articleId) {
  await page.goto(`https://juejin.cn/post/${articleId}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#article-root', { timeout: 30000 }).catch(() => {});

  return page.evaluate(() => {
    const root = document.querySelector('#article-root');
    if (!root) return { markdown: '' };

    function toMd(el) {
      if (el.nodeType === 3) return el.textContent;
      if (!el.tagName) return '';
      const tag = el.tagName.toLowerCase();
      const children = [...el.childNodes].map(toMd).join('');

      if (tag === 'h1') return `\n# ${children.trim()}\n\n`;
      if (tag === 'h2') return `\n## ${children.trim()}\n\n`;
      if (tag === 'h3') return `\n### ${children.trim()}\n\n`;
      if (tag === 'p') return `${children.trim()}\n\n`;
      if (tag === 'pre') {
        const code = el.querySelector('code');
        const text = code?.innerText || el.innerText || '';
        return `\n\`\`\`\n${text.trim()}\n\`\`\`\n\n`;
      }
      if (tag === 'code' && el.parentElement?.tagName !== 'PRE') return `\`${children}\``;
      if (tag === 'li') return `- ${children.trim()}\n`;
      if (tag === 'ul' || tag === 'ol') return `\n${children}\n`;
      return children;
    }

    return { markdown: toMd(root).trim() };
  });
}

async function main() {
  const all = await fetchAllArticles();
  const missing = all.filter((a) =>
    WANT_KEYWORDS.some((k) => a.article_info.title.includes(k))
  );

  console.log('Will fetch:', missing.map((a) => a.article_info.title));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  for (const a of missing) {
    const info = a.article_info;
    const folder = getFolder(info.title);
    const dir = path.join(BASE, folder);
    fs.mkdirSync(dir, { recursive: true });
    const filename = info.title.replace(/[\\/:*?"<>|]/g, '') + '.md';
    const filepath = path.join(dir, filename);

    if (fs.existsSync(filepath)) {
      console.log('SKIP exists:', filepath);
      continue;
    }

    console.log('Scraping:', info.title);
    const { markdown } = await scrapeArticle(page, info.article_id);
    if (!markdown || markdown.length < 50) {
      console.log('  WARN: content too short');
      continue;
    }

    const header = `# ${info.title}\n\n> 来源: https://juejin.cn/post/${info.article_id}\n\n`;
    fs.writeFileSync(filepath, header + markdown, 'utf8');
    console.log('  Saved:', filepath);
    await new Promise((r) => setTimeout(r, 1500));
  }

  await browser.close();
  console.log('Done');
}

main().catch(console.error);
