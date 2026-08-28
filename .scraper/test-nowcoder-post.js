const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function extractPost(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2000);

  return page.evaluate(() => {
    const titleEl =
      document.querySelector('h1') ||
      document.querySelector('[class*="title"]') ||
      document.querySelector('title');
    const title = (titleEl?.textContent || document.title || '').trim();

    const contentEl =
      document.querySelector('.post-topic-des') ||
      document.querySelector('[class*="post-content"]') ||
      document.querySelector('[class*="discuss-content"]') ||
      document.querySelector('[class*="feed-content"]') ||
      document.querySelector('article') ||
      document.querySelector('.nc-post-content');

    let content = '';
    if (contentEl) content = contentEl.innerText || '';
    if (!content || content.length < 30) {
      const main = document.querySelector('main') || document.body;
      content = main.innerText || '';
    }

    return {
      title: title.replace(/_牛客网.*/, '').trim(),
      content: content.slice(0, 20000),
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
    };
  });
}

async function main() {
  const url = process.argv[2] || 'https://www.nowcoder.com/discuss/918816229538693120';
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  );
  const data = await extractPost(page, url);
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

main().catch(console.error);
