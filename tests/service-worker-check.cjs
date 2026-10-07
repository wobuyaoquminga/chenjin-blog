'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));

const origin = process.env.SITE_ORIGIN || 'https://121.43.101.242';
const patched = fs.readFileSync(process.env.CLOUDREVE_WORKER_FILE || path.join(__dirname, '../.cache/deployed-cloudreve-sw.js'), 'utf8');
const blogRule = '/^\\/blog(?:\\/|$)/,';
assert.equal(patched.split(blogRule).length, 2, 'The patch must exclude /blog exactly once');
const original = patched.split(/\r?\n/).slice(2).join('\n').replace(blogRule, '');

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'allow' });
  let script = original;
  await context.route(/\/sw\.js(?:\?.*)?$/, route => route.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'Cache-Control': 'no-store' }, body: script }));
  const page = await context.newPage();
  context.on('page', p => p.on('framenavigated', f => console.log('NAV', f.url())));
  try {
    await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    const blogPage = await context.newPage();
    await blogPage.goto(origin + '/blog/', { waitUntil: 'domcontentloaded' });
    assert.equal(await blogPage.title(), '我的网盘', 'Original Cloudreve worker should hijack the blog');
    console.log('Reproduced: installed Cloudreve worker serves its app at /blog/.');

    if (process.env.EXPECT_DEPLOYED_SW === '1') await context.unroute(/\/sw\.js(?:\?.*)?$/);
    else script = patched;
    await page.evaluate(() => { window.__qaRootMarker = 'kept'; });
    const recovered = blogPage.waitForEvent('framenavigated', {
      predicate: frame => frame === blogPage.mainFrame() && new URL(frame.url()).pathname === '/blog/',
      timeout: 20000,
    });
    await page.evaluate(async deployed => {
      const changed = new Promise((resolve, reject) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        setTimeout(() => reject(new Error('Service worker did not take control')), 15000);
      });
      const registration = deployed
        ? await navigator.serviceWorker.getRegistration('/')
        : await navigator.serviceWorker.register('/sw.js?patched-test=1', { scope: '/' });
      await registration.update();
      await changed;
    }, process.env.EXPECT_DEPLOYED_SW === '1');
    await recovered;
    await context.unroute(/\/sw\.js(?:\?.*)?$/);

    await blogPage.waitForLoadState('domcontentloaded');
    await blogPage.waitForFunction(() => !!document.querySelector('link[rel="https://api.w.org/"]')?.href.includes('/blog/wp-json/'), { timeout: 30000 });
    assert.match(await blogPage.content(), /\/blog\/wp-json\//, 'Updated worker should restore the open blog tab');
    await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
    assert.equal(await page.title(), '我的网盘', 'Cloudreve root should still work');
    console.log('Passed: updated worker serves WordPress at /blog/ and Cloudreve at /.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
