'use strict';
const assert = require('node:assert/strict');
const base = (process.env.BLOG_URL || 'https://121.43.101.242/blog').replace(/\/$/, '');
async function main() {
  for (const route of ['/', '/articles/', '/projects/', '/about/', '/contact/', '/privacy/', '/feed/', '/sitemap.xml', '/wp-login.php']) {
    const r = await fetch(base + route);
    assert.equal(r.status, 200, route);
    const body = await r.text();
    assert.ok(body.length > 100, route + ' body missing');
    assert.ok(!/Fatal error|Warning:.*on line|Parse error/.test(body), route + ' PHP error');
    console.log('OK', route, r.status);
  }
  for (const route of ['/wp-config.php', '/xmlrpc.php', '/.git/config', '/wp-content/uploads/qa-forbidden.php']) {
    const r = await fetch(base + route);
    assert.ok([403, 404].includes(r.status), route + ' should be inaccessible');
    console.log('Protected', route, r.status);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
