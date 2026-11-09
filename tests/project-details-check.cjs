'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));
const base = (process.env.BLOG_URL || 'https://nixiang.me/blog').replace(/\/$/, '');
const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../wp-content/plugins/chenjin-github/project-details.json'), 'utf8'));
const output = path.resolve(__dirname, '../.cache/project-details');
fs.mkdirSync(output, { recursive: true });
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const response = await page.goto(base + '/projects/', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    for (const [name, profile] of Object.entries(catalog)) {
      const card = page.locator('.ws-project-card').filter({ has: page.locator('h3 a[href="https://github.com/wobuyaoquminga/' + name + '"]') });
      assert.equal(await card.count(), 1, name);
      await card.locator('.ws-project-details > summary').click();
      assert.equal(await card.locator('.ws-project-details').getAttribute('open'), '');
      const text = await card.innerText();
      assert.ok(text.includes(profile.features[0]), name + ' features');
      assert.ok(text.includes(profile.getting_started[0]), name + ' usage');
      assert.match(text, /仓库信息/);
      assert.match(text, /许可证/);
      assert.match(text, /文档与版本/);
      assert.ok(text.includes(profile.verified_on), name + ' review date');
      assert.ok(await card.locator('.ws-project-documentation a').count() >= 2);
      if (name === 'chenjin-blog') await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
      const downloads = card.locator('.ws-project-downloads');
      if (await downloads.count()) {
        await downloads.locator('summary').click();
        assert.ok(await downloads.locator('a:visible').count() >= 1);
        await downloads.locator('summary').click();
      }
      await card.locator('.ws-project-details > summary').click();
    }
    await page.locator('.ws-project-search').fill('离线');
    assert.ok(await page.locator('.ws-project-card:visible').count() >= 1, 'Chinese detail search');
    await page.locator('.ws-project-search').fill('');
    await page.setViewportSize({ width: 390, height: 844 });
    for (const summary of await page.locator('.ws-project-details summary').all()) {
      await summary.click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Expanded detail mobile overflow');
      await summary.click();
    }
    await page.locator('.ws-project-details summary').first().click();
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('All reviewed project details, usage, documentation, Chinese search, expand/collapse and mobile layout passed.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
