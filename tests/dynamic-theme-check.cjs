'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));
const base = (process.env.BLOG_URL || 'https://nixiang.me/blog').replace(/\/$/, '');
const out = path.resolve(__dirname, '../.cache/dynamic-theme');
fs.mkdirSync(out, { recursive: true });
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function visit(route, status = 200) {
    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), status, route);
    assert.ok(await page.locator('.cjn-header').isVisible());
    assert.ok(await page.locator('.cjn-footer').isVisible());
    assert.ok(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor.match(/\d+/g).slice(0, 3).every(channel => Number(channel) < 35)), route + ' dark surface');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ' overflow');
    assert.ok(await page.locator('.cjn-footer a[href="https://beian.miit.gov.cn/"]').filter({ hasText: /ICP备/ }).count(), 'Configured filing link preserved');
  }
  async function capture(filename) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .75) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 120));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, filename), fullPage: true });
  }
  try {
    await visit('/');
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.cjn-orbit, .cjn-kicker, .cjn-marquee, .cjn-section-index, .cjn-outro').count(), 0);
    assert.equal(await page.locator('.cjn-hero p').count(), 0, 'No auxiliary hero copy');
    await page.locator('[data-solar-system][data-solar-state=ready]').waitFor({timeout:60000});
    await capture('home-desktop.png');
    await page.locator('[data-cjn-search]').click();
    assert.equal(await page.locator('[data-cjn-search]').getAttribute('aria-expanded'), 'true');
    await page.locator('#cjn-search input[type=search]').fill('计数');
    await Promise.all([page.waitForURL('**/?s=*'), page.locator('#cjn-search button[type=submit]').click()]);
    assert.match(await page.locator('main').innerText(), /计数/);
    for (const route of ['/articles/', '/projects/', '/about/', '/contact/', '/privacy/', '/diandian-counter/']) {
      await visit(route);
      await capture(route.split('/')[1] + '-desktop.png');
    }
    await visit('/missing-dynamic-theme-check/', 404);
    await page.setViewportSize({ width: 390, height: 844 });
    await visit('/');
    const menu = page.locator('[data-cjn-menu-toggle]');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    await menu.click();
    await Promise.all([page.waitForURL('**/projects/'), page.locator('#cjn-nav a').filter({ hasText: '项目' }).click()]);
    await page.locator('.ws-project-details summary').first().click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await capture('projects-mobile.png');
    for (const route of ['/', '/articles/', '/contact/', '/diandian-counter/']) {
      await visit(route);
      await capture(route === '/' ? 'home-mobile.png' : route.split('/')[1] + '-mobile.png');
    }
    await page.setViewportSize({ width: 320, height: 720 });
    await visit('/');
    await visit('/contact/');
    const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await reducedPage.locator('[data-solar-state=ready]').waitFor({timeout:90000});
    assert.equal(await reducedPage.locator('body').evaluate(el => el.classList.contains('cjn-motion')), false);
    assert.equal(await reducedPage.evaluate(() => document.getAnimations().filter(a => a.effect.getTiming().iterations === Infinity).length), 0, 'Reduced motion should stop endless decoration');
    await reduced.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const basicPage = await noJS.newPage();
    await basicPage.goto(base + '/', { waitUntil: 'domcontentloaded' });
    assert.ok(await basicPage.locator('h1').isVisible());
    assert.ok(await basicPage.locator('#cjn-nav a').first().isVisible(), 'No-JS navigation');
    assert.ok(await basicPage.locator('.cjn-noscript-search input').isVisible(), 'No-JS search');
    await noJS.close();
    assert.deepEqual(errors, []);
    console.log('Dynamic shell, search, menus, all public routes, mobile 320/390px, reduced motion, no-JS navigation and filing link passed.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
