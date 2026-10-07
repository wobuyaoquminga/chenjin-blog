# 备份与恢复

系统每天 03:20（服务器为 Asia/Shanghai）运行备份。完整备份位于 `/var/backups/chenjin-blog/YYYYMMDDTHHMMSSZ/`，时间戳使用 UTC；保留约两周。文件只允许 root 读取。

每份备份包括数据库、全部 wp-content（主题、插件、附件）、wp-config.php 和服务器相关配置，同时生成 SHA256SUMS。数据库采用 MySQL 单事务导出，适用于本站 InnoDB 表；如需数据库和上传附件在同一时刻的严格一致快照，先进入维护模式，暂停写入后再备份。

```bash
sudo /opt/chenjin-blog/backup.sh
sudo ls /var/backups/chenjin-blog/
```

这是服务器本地备份，无法抵御整台服务器磁盘损坏。请将备份另存到你掌控的加密存储。备份含密码、邮箱和评论等数据，不能放入公开 GitHub 仓库。

## 恢复前

先确认备份目录、校验和及要恢复的时间点。恢复会覆盖当前博客数据，务必先保存当前状态。下列命令需在服务器上由管理员选择真实备份目录后执行。

如果重建整台服务器，需要先安装对应版本 WordPress 内核、PHP、MySQL 和 Nginx，创建博客数据库用户，并准备受信任的 HTTPS 证书。备份内的 wp-config.php 包含当时的数据库连接密码，重建数据库用户时必须与该密码一致；管理员账号密码哈希随数据库恢复，无需依赖最初的明文交付文件。备份不会包含整台服务器或其他应用数据。

```bash
cd /var/backups/chenjin-blog/选择的时间戳
sha256sum -c SHA256SUMS
gzip -t database.sql.gz
tar -tzf content.tar.gz | head
```

## 恢复博客数据

启用维护模式，暂停博客 Cron 后恢复。不要恢复到其他应用数据库。

```bash
sudo -u www-data wp --path=/var/www/chenjin/blog maintenance-mode activate
# 将 /etc/cron.d/chenjin-blog 暂时移到 root 专用目录，恢复后原位放回。
sudo bash -c 'gzip -dc database.sql.gz | mysql chenjin_blog'
sudo tar -xzf content.tar.gz -C /var/www/chenjin/blog
sudo chown -R www-data:www-data /var/www/chenjin/blog/wp-content
sudo chown www-data:www-data /var/www/chenjin/blog/wp-config.php
sudo chmod 640 /var/www/chenjin/blog/wp-config.php
sudo systemctl reload php8.3-fpm
sudo -u www-data wp --path=/var/www/chenjin/blog cache flush
sudo -u www-data wp --path=/var/www/chenjin/blog maintenance-mode deactivate
```

恢复附件时，覆盖解压不会删除备份之后新增的文件；如需严格恢复目录，应先将当前 wp-content 移到受保护的归档位置，然后解压备份。服务器配置包仅供比对，其他应用仍会更新 Nginx 配置，**不要直接覆盖整份共享 Nginx 主机配置**。

恢复后检查首页、正文、后台登录、图片、项目资源、RSS、搜索与评论，并恢复博客 Cron。部署时会执行隔离数据库导入演练；实际线上灾难恢复仍需由管理员选择恢复时间点。
