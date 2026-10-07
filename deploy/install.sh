#!/usr/bin/env bash
# Deployment bundle for the inspected Ubuntu 24.04 server, existing MySQL/Nginx.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run: sudo bash deploy/install.sh' >&2; exit 1; }
umask 077
bundle=$(cd "$(dirname "$0")/.." && pwd)
blog_root=/var/www/chenjin/blog
site_url=${BLOG_URL:-https://121.43.101.242/blog}
admin_email=${BLOG_ADMIN_EMAIL:-admin@example.invalid}
nginx_site=${BLOG_NGINX_SITE:-/etc/nginx/sites-available/chat-ip.conf}
[[ -f "$nginx_site" ]] || { echo 'Existing HTTPS virtual host is required.' >&2; exit 1; }
if [[ -f "$blog_root/wp-config.php" && ! -f /etc/chenjin-blog/managed-by ]]; then
    echo 'An existing unmanaged WordPress site occupies the target. Refusing to change it.' >&2
    exit 1
fi
export DEBIAN_FRONTEND=noninteractive
apt-get install -y --no-install-recommends php8.3-fpm php8.3-cli php8.3-mysql php8.3-curl php8.3-mbstring php8.3-xml php8.3-gd php8.3-zip php8.3-intl unzip
install -d -m 755 "$blog_root" /opt/chenjin-blog
install -d -m 700 /etc/chenjin-blog /var/backups/chenjin-blog/config
if [[ ! -x /usr/local/bin/wp ]]; then
    curl --fail --location --retry 3 --max-time 180 https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar -o /etc/chenjin-blog/wp.phar
    echo 'ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c  /etc/chenjin-blog/wp.phar' | sha256sum -c -
    install -m 755 /etc/chenjin-blog/wp.phar /usr/local/bin/wp
fi
wp_root() { /usr/local/bin/wp --allow-root --path="$blog_root" "$@"; }
if [[ ! -f "$blog_root/wp-load.php" ]]; then
    wp_root core download --version=7.1.2 --locale=en_US
    wp_root core verify-checksums --version=7.1.2 --locale=en_US
fi
if [[ ! -f "$blog_root/wp-config.php" ]]; then
    [[ -s /etc/chenjin-blog/db-password ]] || openssl rand -hex 24 > /etc/chenjin-blog/db-password
    db_password=$(cat /etc/chenjin-blog/db-password)
    existing_tables=$(mysql -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='chenjin_blog';")
    [[ "$existing_tables" == 0 ]] || { echo 'Existing blog tables found without wp-config.php; inspect before installing.' >&2; exit 1; }
    mysql <<SQL
CREATE DATABASE IF NOT EXISTS chenjin_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chenjin_blog'@'localhost' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON chenjin_blog.* TO 'chenjin_blog'@'localhost';
SQL
    wp_root config create --dbname=chenjin_blog --dbuser=chenjin_blog --dbhost=localhost --prompt=dbpass < /etc/chenjin-blog/db-password >/dev/null
    unset db_password
fi
wp_root config set DISALLOW_FILE_EDIT true --raw
wp_root config set DISABLE_WP_CRON true --raw
wp_root config set FORCE_SSL_ADMIN true --raw
wp_root config set WP_MEMORY_LIMIT 128M
wp_root config set WP_MAX_MEMORY_LIMIT 128M
if ! wp_root core is-installed; then
    openssl rand -base64 30 > /etc/chenjin-blog/admin-password
    wp_root core install --url="$site_url" --title='陈今的博客' --admin_user=chenjin --admin_email="$admin_email" --locale=zh_CN --skip-email --prompt=admin_password < /etc/chenjin-blog/admin-password >/dev/null
    printf '博客后台：%s/wp-admin/\n用户名：chenjin\n密码：' "$site_url" > /etc/chenjin-blog/access.txt
    cat /etc/chenjin-blog/admin-password >> /etc/chenjin-blog/access.txt
    wp_root user update chenjin --display_name='陈今' --nickname='陈今'
    wp_root post delete 1 2 --force
fi
printf 'chenjin-blog\n' > /etc/chenjin-blog/managed-by
printf '%s\n' "$nginx_site" > /etc/chenjin-blog/nginx-site
cp -a "$bundle/wp-content/themes/chenjin-journal" "$blog_root/wp-content/themes/"
cp -a "$bundle/wp-content/plugins/chenjin-github" "$blog_root/wp-content/plugins/"
cp -a "$bundle/wp-content/plugins/chenjin-contact" "$blog_root/wp-content/plugins/"
rm -f "$blog_root/wp-content/plugins/chenjin-github/test-sync.php"
rm -f "$blog_root/wp-content/plugins/chenjin-contact/test-validation.php"
wp_root theme activate chenjin-journal
wp_root plugin activate chenjin-github
wp_root plugin activate chenjin-contact
wp_root plugin install slim-seo limit-login-attempts-reloaded --activate
wp_root plugin auto-updates enable slim-seo limit-login-attempts-reloaded
wp_root language core install zh_CN --activate
wp_root language plugin install --all zh_CN
wp_root eval-file "$bundle/deploy/seed.php"
wp_root rewrite structure '/%postname%/'
wp_root option update timezone_string Asia/Shanghai
wp_root option update blogdescription '记录开发与创作，分享项目与资源。'
wp_root option update posts_per_page 9
wp_root option update default_ping_status closed
wp_root option update comment_moderation 1
wp_root option update require_name_email 1
wp_root option update users_can_register 0
wp_root option update show_avatars 0
wp_root option update blog_public 1
wp_root ws-github sync
chown -R www-data:www-data "$blog_root"
find "$blog_root" -type d -exec chmod 755 {} +
find "$blog_root" -type f -exec chmod 644 {} +
chmod 640 "$blog_root/wp-config.php"
install -m 644 "$bundle/deploy/php-fpm-blog.conf" /etc/php/8.3/fpm/pool.d/chenjin-blog.conf
install -m 644 "$bundle/deploy/nginx-blog.conf" /etc/nginx/snippets/chenjin-blog.conf
install -m 755 "$bundle/deploy/patch-cloudreve-worker.py" /opt/chenjin-blog/patch-cloudreve-worker.py
python3 /opt/chenjin-blog/patch-cloudreve-worker.py
nginx_backup="/var/backups/chenjin-blog/config/nginx-$(date -u +%Y%m%dT%H%M%SZ).conf"
cp -a "$nginx_site" "$nginx_backup"
python3 - "$nginx_site" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
include = '    include /etc/nginx/snippets/chenjin-blog.conf;'
if include not in s:
    needle = '    listen 443 ssl;'
    if s.count(needle) != 1:
        raise SystemExit('Expected one HTTPS server; configure the include manually.')
    p.write_text(s.replace(needle, needle + '\n' + include, 1))
PY
if ! nginx -t; then
    cp -a "$nginx_backup" "$nginx_site"
    echo 'Nginx config rejected; previous config restored.' >&2
    exit 1
fi
php-fpm8.3 -t
systemctl enable --now php8.3-fpm
systemctl reload php8.3-fpm
systemctl reload nginx
install -m 750 "$bundle/deploy/backup.sh" /opt/chenjin-blog/backup.sh
cat > /etc/cron.d/chenjin-blog <<'CRON'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/5 * * * * www-data flock -n /tmp/chenjin-blog-cron.lock /usr/local/bin/wp --path=/var/www/chenjin/blog cron event run --due-now --quiet >> /var/log/chenjin-blog-cron.log 2>&1
20 3 * * * root /opt/chenjin-blog/backup.sh >> /var/log/chenjin-blog-backup.log 2>&1
CRON
touch /var/log/chenjin-blog-cron.log
chown www-data:www-data /var/log/chenjin-blog-cron.log
chmod 640 /var/log/chenjin-blog-cron.log
cat > /etc/logrotate.d/chenjin-blog <<'ROTATE'
/var/log/chenjin-blog-cron.log /var/log/chenjin-blog-backup.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
    copytruncate
}
ROTATE
/opt/chenjin-blog/backup.sh
curl --fail --silent --show-error "$site_url/" >/dev/null
echo "Blog ready: $site_url/ (credentials: /etc/chenjin-blog/access.txt)"
