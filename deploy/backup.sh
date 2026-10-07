#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root.' >&2; exit 1; }
umask 077
backup_root=/var/backups/chenjin-blog
stamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$backup_root"
exec 9>/run/lock/chenjin-blog-backup.lock
flock -n 9 || exit 0
backup_dir=$(mktemp -d "$backup_root/.incomplete-XXXXXX")
trap 'echo "Backup incomplete: $backup_dir" >&2' ERR
nginx_site=$(cat /etc/chenjin-blog/nginx-site)
[[ "$nginx_site" == /etc/nginx/* && -f "$nginx_site" ]] || { echo 'Invalid blog Nginx configuration path.' >&2; exit 1; }
mysqldump --single-transaction --no-tablespaces --routines --triggers chenjin_blog | gzip > "$backup_dir/database.sql.gz"
tar -C /var/www/chenjin/blog -czf "$backup_dir/content.tar.gz" wp-config.php wp-content
tar -czf "$backup_dir/server-config.tar.gz" /etc/nginx/snippets/chenjin-blog.conf /etc/php/8.3/fpm/pool.d/chenjin-blog.conf /etc/cron.d/chenjin-blog "$nginx_site" /etc/chenjin-blog/nginx-site /etc/chenjin-blog/managed-by 2>/dev/null
gzip -t "$backup_dir/database.sql.gz"
tar -tzf "$backup_dir/content.tar.gz" >/dev/null
(cd "$backup_dir" && sha256sum database.sql.gz content.tar.gz server-config.tar.gz > SHA256SUMS)
mv "$backup_dir" "$backup_root/$stamp"
# Only completed backup directories owned by this script are eligible for retention.
find "$backup_root" -mindepth 1 -maxdepth 1 -type d -name '20??????T??????Z' -mtime +14 -exec rm -rf -- {} +
echo "Backup verified: $backup_root/$stamp"
