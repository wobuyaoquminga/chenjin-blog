// Read-only by default. BLOG_WRITE_QA=1 enables temporary administrator draft/media/comment QA.
// Set BLOG_URL, PLAYWRIGHT_MODULE and BLOG_CREDENTIAL_FILE for another environment.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const base = (process.env.BLOG_URL || 'https://121.43.101.242/blog').replace(/\/$/, '');
const out = path.join(root, 'docs/screenshots');
fs.mkdirSync(out, { recursive: true });
async function main() {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function visit(url, status = 200) {
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), status, url);
    assert.ok(['zh-CN', 'zh-Hans'].includes(await page.locator('html').getAttribute('lang')), 'Chinese page language');
  }
  try {
    await visit(base + '/');
    assert.match(await page.title(), /陈今/);
    assert.equal(await page.locator('h1').count(), 1);
    await page.screenshot({ path: path.join(out, 'home-desktop.png'), fullPage: true });
    const themeButton = page.locator('.theme-toggle');
    if (await themeButton.count()) {
      const before = await page.locator('html').getAttribute('data-theme');
      await themeButton.click();
      assert.notEqual(await page.locator('html').getAttribute('data-theme'), before);
      const after = await page.locator('html').getAttribute('data-theme');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-theme'), after);
      await themeButton.click();
    }
    await visit(base + '/projects/');
    const reposResponse = await fetch('https://api.github.com/users/wobuyaoquminga/repos?per_page=100&type=owner', { headers: { 'User-Agent': 'blog-qa' } });
    assert.ok(reposResponse.ok);
    const repos = await reposResponse.json();
    for (const repo of repos) {
      assert.ok((await page.locator('.ws-project-card').allTextContents()).some(text => text.includes(repo.name)), 'Public repo missing: ' + repo.name);
    }
    assert.equal(await page.locator('.ws-project-card').count(), repos.length);
    const resources = page.locator('.ws-project-card a[href*="/releases/download/"]');
    assert.ok(await resources.count() >= 2, 'Release download resources missing');
    await page.screenshot({ path: path.join(out, 'projects-desktop.png'), fullPage: true });
    await page.locator('.ws-project-search').fill('definitely-no-such-project-9381');
    assert.equal(await page.locator('.ws-project-card:visible').count(), 0);
    assert.ok(await page.locator('.ws-project-filter-empty').isVisible());
    await page.locator('.ws-project-search').fill('diandian');
    assert.equal(await page.locator('.ws-project-card:visible').count(), 1);
    await page.locator('.ws-project-search').fill('');
    const language = await page.locator('.ws-project-language option').allTextContents();
    if (language.length > 1) {
      await page.locator('.ws-project-language').selectOption({ label: language[1] });
      assert.ok(await page.locator('.ws-project-card:visible').count() >= 1);
      await page.locator('.ws-project-language').selectOption('');
    }
    await page.locator('.ws-project-sort').selectOption('name');
    const names = await page.locator('.ws-project-card').evaluateAll(cards => cards.map(c => c.dataset.name));
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
    await visit(base + '/articles/');
    assert.ok(await page.locator('.post-card').count() >= 2);
    await visit(base + '/?s=' + encodeURIComponent('计数'));
    assert.match(await page.locator('main').innerText(), /计数/);
    await visit(base + '/?s=definitely-no-article-9381');
    assert.match(await page.locator('main').innerText(), /没有|暂无|未找到/);
    await visit(base + '/diandian-counter/');
    assert.ok(await page.locator('#commentform').count());
    await page.screenshot({ path: path.join(out, 'article-desktop.png'), fullPage: true });
    await visit(base + '/missing-page-for-validation-9381/', 404);
    for (const route of ['/about/', '/privacy/']) await visit(base + route);
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/', '/projects/', '/diandian-counter/']) {
      await visit(base + route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile overflow: ' + route);
      await page.screenshot({ path: path.join(out, route === '/' ? 'home-mobile.png' : route.includes('projects') ? 'projects-mobile.png' : 'article-mobile.png'), fullPage: true });
    }
    if (process.env.BLOG_WRITE_QA === '1') {
      const credential = fs.readFileSync(process.env.BLOG_CREDENTIAL_FILE || path.join(root, '.private/access.txt'), 'utf8');
      const password = credential.match(/密码：([^\r\n]+)/)?.[1];
      assert.ok(password, 'Private credential file is missing a password');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base + '/wp-login.php', { waitUntil: 'domcontentloaded' });
      await page.locator('#user_login').fill('chenjin');
      await page.locator('#user_pass').fill(password);
      await Promise.all([page.waitForURL('**/wp-admin/**'), page.locator('#wp-submit').click()]);
      assert.match(page.url(), /wp-admin/);
      await page.goto(base + '/wp-admin/post-new.php', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.wp?.apiFetch);
      let postId, mediaId;
      try {
        const qa = await page.evaluate(async () => {
          const draft = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: '临时验收文章', content: '<h2>目录验收</h2><p>临时验收数据。</p><pre><code>const verified = true;</code></pre>', status: 'draft', comment_status: 'open' } });
          const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6fWQAAAAASUVORK5CYII='), c => c.charCodeAt(0));
          const media = await wp.apiFetch({ path: '/wp/v2/media', method: 'POST', headers: { 'Content-Disposition': 'attachment; filename="blog-qa-pixel.png"', 'Content-Type': 'image/png' }, body: bytes });
          await wp.apiFetch({ path: '/wp/v2/posts/' + draft.id, method: 'POST', data: { featured_media: media.id, status: 'publish' } });
          return { postId: draft.id, mediaId: media.id, link: draft.link };
        });
        postId = qa.postId; mediaId = qa.mediaId;
        assert.ok(postId && mediaId);
        const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const guest = await visitor.newPage();
        await guest.goto(qa.link, { waitUntil: 'networkidle' });
        await guest.locator('#comment').fill('临时验收评论，检查后自动删除。');
        await guest.locator('#author').fill('博客验收');
        await guest.locator('#email').fill('blog-qa@example.invalid');
        await Promise.all([guest.waitForNavigation({ waitUntil: 'networkidle' }), guest.locator('#submit').click()]);
        assert.match(await guest.locator('body').innerText(), /审核|moderation/i);
        const comments = await page.evaluate(id => wp.apiFetch({ path: '/wp/v2/comments?post=' + id + '&status=hold&context=edit' }), postId);
        assert.equal(comments.length, 1, 'Guest comment should await moderation');
        await page.evaluate(id => wp.apiFetch({ path: '/wp/v2/comments/' + id, method: 'POST', data: { status: 'approved' } }), comments[0].id);
        await guest.goto(qa.link, { waitUntil: 'networkidle' });
        assert.match(await guest.locator('body').innerText(), /临时验收评论/);
        await visitor.close();
        console.log('Admin login, editor API, draft/publish, media upload and comment moderation passed.');
      } finally {
        if (postId) await page.evaluate(id => wp.apiFetch({ path: '/wp/v2/posts/' + id + '?force=true', method: 'DELETE' }), postId);
        if (mediaId) await page.evaluate(id => wp.apiFetch({ path: '/wp/v2/media/' + id + '?force=true', method: 'DELETE' }), mediaId);
      }
    }
    assert.deepEqual(errors, [], 'Browser JavaScript errors');
    console.log('Public pages, complete public repositories, resources, search/filter/sort, theme persistence, 404 and mobile layout passed.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
