# 贡献指南

欢迎为陈今的博客提交问题和改进。普通故障请使用 [问题反馈](https://github.com/wobuyaoquminga/chenjin-blog/issues/new?template=bug_report.yml)，新想法请使用 [功能建议](https://github.com/wobuyaoquminga/chenjin-blog/issues/new?template=feature_request.yml)。安全漏洞请按 [安全说明](SECURITY.md) 私下报告。

提交 Issue 时，请写清复现步骤、预期与实际结果，以及相关浏览器、WordPress 和 PHP 版本。截图请先遮盖个人资料。不要提交密码、令牌、Cookie、私钥、原始生产数据、访客留言或服务器日志原文；用脱敏的最小示例说明问题。

Pull Request 请保持改动聚焦，说明用途和验证方法。修改界面时保持中文及手机可用性，并附脱敏截图。修改主题、插件或部署代码时，请留意 `/blog/` 子路径部署、WordPress 转义与权限检查，以及公开仓库同步只处理公开数据。

提交前运行与 GitHub Actions 一致的源码检查（需要 PHP、Node.js 和 Bash）：

```bash
find wp-content deploy -name '*.php' -print0 | xargs -0 -n1 php -l
php wp-content/plugins/chenjin-github/test-sync.php
php wp-content/plugins/chenjin-contact/test-validation.php
node --check wp-content/themes/chenjin-news/reading.js
node --check wp-content/plugins/chenjin-github/projects.js
node --check tests/browser-check.cjs
node --check tests/public-check.cjs
node --check tests/contact-check.cjs
node --check tests/service-worker-check.cjs
bash -n deploy/install.sh deploy/update.sh deploy/backup.sh
```

涉及交互的改动可补充浏览器验证，说明测试环境和结果。生产站点检查脚本可能创建临时内容或需要管理员凭据；运行前请阅读脚本并使用自己有权管理的环境。不要把凭据、数据库或真实访客资料加入仓库或测试夹具。

公网检查可通过 `BLOG_URL` 指定站点。浏览器脚本还使用 `PLAYWRIGHT_MODULE`、`BROWSER_EXE` 和 `BLOG_CREDENTIAL_FILE`；`BLOG_WRITE_QA=1` 才会启用文章/媒体/评论写入验收，联系脚本始终提交一条临时来信。截图和仓库数量断言使用演示站点的品牌及 GitHub 账号，测试不同安装时需同步调整这些断言。
