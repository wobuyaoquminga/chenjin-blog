#!/usr/bin/env bash
# Update the custom theme/plugin only; preserve owner content and credentials.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root.' >&2; exit 1; }
bundle=$(cd "$(dirname "$0")/.." && pwd)
root=/var/www/chenjin/blog
[[ -f "$root/wp-config.php" ]] || { echo 'Install the blog first.' >&2; exit 1; }
/opt/chenjin-blog/backup.sh
find "$bundle/wp-content" -name '*.php' -exec php -l {} \;
cp -a "$bundle/wp-content/themes/chenjin-journal" "$root/wp-content/themes/"
cp -a "$bundle/wp-content/plugins/chenjin-github" "$root/wp-content/plugins/"
cp -a "$bundle/wp-content/plugins/chenjin-contact" "$root/wp-content/plugins/"
rm -f "$root/wp-content/plugins/chenjin-github/test-sync.php"
rm -f "$root/wp-content/plugins/chenjin-contact/test-validation.php"
chown -R www-data:www-data "$root/wp-content/themes/chenjin-journal" "$root/wp-content/plugins/chenjin-github" "$root/wp-content/plugins/chenjin-contact"
install -m 755 "$bundle/deploy/patch-cloudreve-worker.py" /opt/chenjin-blog/patch-cloudreve-worker.py
python3 /opt/chenjin-blog/patch-cloudreve-worker.py
install -m 644 "$bundle/deploy/nginx-blog.conf" /etc/nginx/snippets/chenjin-blog.conf
nginx -t
systemctl reload nginx
sudo -u www-data /usr/local/bin/wp --path="$root" plugin activate chenjin-contact
sudo -u www-data /usr/local/bin/wp --path="$root" cache flush
sudo -u www-data /usr/local/bin/wp --path="$root" ws-github sync
systemctl reload php8.3-fpm
echo 'Custom theme and plugin updated. Owner content retained.'
