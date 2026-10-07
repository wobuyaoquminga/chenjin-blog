# 部署与维护

当前入口为 `https://121.43.101.242/blog/`，使用既有 IP 证书和 Nginx HTTPS 虚拟主机。IP 地址下已有网盘、聊天 API 和校园站点，博客路由单独位于 `/blog/`。

同一地址上的网盘有根作用域 PWA worker。部署脚本从本机网盘服务生成兼容 worker，保留网盘缓存逻辑并排除博客导航；通过 `/sw.js` 的禁止缓存响应及时更新旧浏览器。生成的第三方 worker 不打包进源码。网盘前端升级后运行 `sudo python3 /opt/chenjin-blog/patch-cloudreve-worker.py` 重新生成。

该补丁针对本机 `127.0.0.1:5212` 上的 Cloudreve。独立部署到没有 Cloudreve 的服务器时，移除 Nginx 片段的 `/sw.js` location，并跳过安装脚本中两行 worker 生成命令。

## 服务器目录

- WordPress：`/var/www/chenjin/blog`
- 博客数据库与最小权限数据库用户：`chenjin_blog`
- PHP-FPM：`/etc/php/8.3/fpm/pool.d/chenjin-blog.conf`
- Nginx 片段：`/etc/nginx/snippets/chenjin-blog.conf`
- 现有 HTTPS 主机：`/etc/nginx/sites-available/chat-ip.conf`
- 凭据：`/etc/chenjin-blog/`，root 专用。
- 备份：`/var/backups/chenjin-blog/`，不在 Web 根目录。
- 定时任务：`/etc/cron.d/chenjin-blog`
- 备份程序：`/opt/chenjin-blog/backup.sh`

PHP 使用按需启动进程池，最多三个子进程，每个内存上限 128MB。对大量并发访问需要结合负载监控再调整容量。

## 其他服务器

安装前先配置 MySQL 8 和 Nginx HTTPS 虚拟主机。安装脚本不替你申请新证书，也不会创建公开可访问的安装页面后等待配置。它需要 root 本地 MySQL socket 管理权限。

```bash
sudo BLOG_URL=https://example.com/blog \
  BLOG_ADMIN_EMAIL=your-admin@example.com \
  BLOG_NGINX_SITE=/etc/nginx/sites-available/example.conf \
  bash deploy/install.sh
```

目标虚拟主机内应恰好有一行四空格缩进的 `listen 443 ssl;`。不满足时脚本停止，请先人工检查并在对应 HTTPS server 中加入 `include /etc/nginx/snippets/chenjin-blog.conf;`。不要向不属于此博客的 server 块添加路由。

管理员邮箱应设为自己的真实邮箱；示例地址仅作占位，省略时脚本使用不投递邮件的 `admin@example.invalid`。邮箱地址和邮件服务密码不需要写进源码。对于已有的非本项目 WordPress 目录或已有的同名数据表，安装脚本会拒绝自动接管。

## 日常检查

```bash
sudo nginx -t
sudo systemctl status php8.3-fpm nginx --no-pager
sudo -u www-data wp --path=/var/www/chenjin/blog cron event list
sudo -u www-data wp --path=/var/www/chenjin/blog ws-github sync
sudo tail -n 50 /var/log/chenjin-blog-cron.log
sudo tail -n 50 /var/log/chenjin-blog-backup.log
```

IP 证书由已有的 `chat-certbot-renew.timer` 维护，博客共用证书。应持续监控续签结果；现有续签机制属于服务器基础设施，源码仓库不包含私钥。

## 定制更新

上传新版本源码到受信任的目录后运行 `sudo bash deploy/update.sh`。脚本先备份，再更新定制主题和同步插件；不重写后台文章、页面和密码。可执行 `wp core update` / `wp plugin update --all` 进行官方升级，升级前先备份并检查插件兼容性。

## 以后换域名

先准备并验证域名 DNS 和新域名证书，独立配置对应的 Nginx 主机。备份后用 WP-CLI `search-replace` 以 `--dry-run` 检查旧地址到新地址，再执行替换，更新 home/siteurl 并重新验收登录、图片、文章、RSS、项目、搜索和评论。不要只改页面中的文字链接。
