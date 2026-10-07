# 第三方来源

- [WordPress](https://github.com/WordPress/WordPress)：成熟博客/CMS 内核，GPL-2.0-or-later，官方发布包通过 WordPress 官方下载渠道安装；部署基线 7.1.2。
- [Blocksy](https://wordpress.org/themes/blocksy/)：`chenjin-news` 新闻风格子主题所依赖的父主题，从 WordPress 官方主题目录安装并开启官方更新；许可证以官方主题包声明为准。
- [Blocksy News](https://creativethemes.com/blocksy/starter-site/news/)：所选的外观参考；使用父主题的原生文章卡片配置布局，未导入演示文章、第三方表单或图库。
- [WP-CLI](https://github.com/wp-cli/wp-cli)：WordPress 命令行工具，MIT；部署基线 2.12.0，安装使用官方发布物及 SHA-256 校验。
- [Slim SEO](https://wordpress.org/plugins/slim-seo/)：SEO 元信息与 sitemap，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- [Limit Login Attempts Reloaded](https://wordpress.org/plugins/limit-login-attempts-reloaded/)：登录重试限制，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- Nginx、PHP、MySQL：使用 Ubuntu 和服务器既有软件源，保留各自许可证。

`chenjin-news` 子主题、保留供回退的 `chenjin-journal` 旧主题与自定义插件由本项目维护，未复制第三方付费主题、字体、图标包或图库。所有项目下载链接指向原始 GitHub 仓库，其源码和发布包遵守各自许可证。
