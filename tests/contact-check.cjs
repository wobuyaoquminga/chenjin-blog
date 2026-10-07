// Creates one private QA message, verifies administrator access and removes it.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));
const base = (process.env.BLOG_URL || 'https://121.43.101.242/blog').replace(/\/$/, '');
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const guest = await browser.newContext();
  const administrator = await browser.newContext();
  const subject = '站内联系验收' + Date.now();
  const body = '这是一条仅管理员可见的临时验收来信。';
  let trashURL;
  const admin = await administrator.newPage();
  try {
    const page = await guest.newPage();
    await page.goto(base + '/contact/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('input[type=email]').count(), 0);
    const rejected = await guest.request.post(base + '/wp-admin/admin-post.php', { form: { action: 'chenjin_contact_submit', subject, message: body }, maxRedirects: 0 });
    assert.equal(rejected.status(), 303);
    assert.match(rejected.headers().location, /contact_error=expired/);
    await page.locator('#chenjin-contact-nickname').fill('匿名访客');
    await page.locator('#chenjin-contact-subject').fill(subject);
    await page.locator('#chenjin-contact-message').fill(body);
    await Promise.all([page.waitForURL('**/contact/?sent=1'), page.locator('.chenjin-contact button[type=submit]').click()]);
    assert.match(await page.locator('.chenjin-contact-notice').innerText(), /已保存/);
    const credential = fs.readFileSync(process.env.BLOG_CREDENTIAL_FILE || path.resolve(__dirname, '../.private/access.txt'), 'utf8');
    const password = credential.match(/密码：([^\r\n]+)/)?.[1];
    assert.ok(password);
    await admin.goto(base + '/wp-login.php', { waitUntil: 'domcontentloaded' });
    await admin.locator('#user_login').fill('chenjin');
    await admin.locator('#user_pass').fill(password);
    await Promise.all([admin.waitForURL('**/wp-admin/**'), admin.locator('#wp-submit').click()]);
    await admin.goto(base + '/wp-admin/edit.php?post_type=chenjin_message', { waitUntil: 'domcontentloaded' });
    const row = admin.locator('tr[id^="post-"]').filter({ hasText: subject });
    assert.equal(await row.count(), 1);
    const editURL = await row.locator('a.row-title').getAttribute('href');
    const id = new URL(editURL).searchParams.get('post');
    trashURL = await row.locator('.row-actions .trash a').getAttribute('href');
    await admin.goto(editURL, { waitUntil: 'domcontentloaded' });
    assert.equal(await admin.locator('#content').inputValue(), body);
    assert.match(await admin.locator('#chenjin-contact-nickname').innerText(), /匿名访客/);
    for (const route of ['/?s=' + encodeURIComponent(subject), '/feed/', '/?post_type=chenjin_message&p=' + id]) {
      const r = await guest.request.get(base + route);
      const text = await r.text();
      assert.ok(!text.includes(body), 'Private message leaked: ' + route);
      if (route.includes('post_type')) assert.ok([403,404].includes(r.status()));
    }
    assert.equal((await guest.request.get(base + '/wp-json/wp/v2/chenjin_message')).status(), 404);
    await admin.goto(trashURL, { waitUntil: 'domcontentloaded' });
    trashURL = null;
    console.log('Contact nonce, anonymous submission, private administrator view and exclusion from public search/feed/REST passed; QA message trashed.');
  } finally {
    if (trashURL) await admin.goto(trashURL).catch(() => {});
    await browser.close();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
