#!/usr/bin/env python3
"""Generate a navigation patch from the installed Cloudreve worker, without bundling it."""
from pathlib import Path
from urllib.request import urlopen
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--output', default='/opt/chenjin-blog/cloudreve-sw.js')
args = parser.parse_args()
with urlopen('http://127.0.0.1:5212/sw.js', timeout=15) as response:
    original = response.read().decode('utf-8')
if original.count('denylist:[') != 1 or 'NavigationRoute' not in original:
    raise SystemExit('Cloudreve worker format changed; inspect before patching.')
rule = r'/^\/blog(?:\/|$)/,'
original = original.replace('denylist:[', 'denylist:[' + rule, 1)
header = '// Generated from installed Cloudreve; exclude the blog navigation.\n'
activation = r'self.skipWaiting(); self.addEventListener("activate", event => event.waitUntil(self.clients.claim().then(() => { setTimeout(async () => { for (const client of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) { if (/^\/blog(?:\/|$)/.test(new URL(client.url).pathname)) await client.navigate(client.url); } }, 250); })));'
target = Path(args.output)
payload = (header + activation + '\n' + original + '\n').encode('utf-8')
if not target.exists() or target.read_bytes() != payload:
    temporary = target.with_suffix('.tmp')
    temporary.write_bytes(payload)
    temporary.chmod(0o644)
    temporary.replace(target)
print('Cloudreve navigation worker patched; original application assets retained.')
