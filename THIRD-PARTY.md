# 第三方来源

- [WordPress](https://github.com/WordPress/WordPress)：成熟博客/CMS 内核，GPL-2.0-or-later，官方发布包通过 WordPress 官方下载渠道安装；部署基线 7.1.2。
- [Blocksy](https://wordpress.org/themes/blocksy/)：`chenjin-news` 新闻风格子主题所依赖的父主题，从 WordPress 官方主题目录安装并开启官方更新；许可证以官方主题包声明为准。
- [Blocksy News](https://creativethemes.com/blocksy/starter-site/news/)：所选的外观参考；使用父主题的原生文章卡片配置布局，未导入演示文章、第三方表单或图库。
- [Three.js 0.187.0](https://github.com/mrdoob/three.js/tree/r187)：用于首页 WebGL 场景的本地 vendored 库，MIT 许可证；许可文本随库保留。
- [Astronomy Engine 2.1.19](https://github.com/cosinekitty/astronomy/tree/v2.1.19)：本地星历计算库，MIT 许可证；用于计算太阳、行星和月球位置，不通过运行时请求其网站或外部星历服务。库的许可证随源码保留。
- [NASA/JPL Horizons](https://ssd-api.jpl.nasa.gov/doc/horizons.html)：用于 2026-11-09 12:00 UTC 八大行星位置的离线对照验证，不是本站运行依赖或实时数据接口。计算位置与 Horizons 的比较不表示观测级精度保证。
- [Solar System Scope 行星贴图](https://www.solarsystemscope.com/textures/)：使用本地 2K 贴图，依据 NASA 地形和影像数据制作并按 CC BY 4.0 发布。部分未测绘区域由素材作者以虚构地形补绘，颜色也经过调整；这些素材不应被描述为未经处理的真实行星照片。素材署名与许可见其[页面许可说明](https://creativecommons.org/licenses/by/4.0/)。
- [卡西尼号土星照片 PIA06193](https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/)：`wp-content/themes/chenjin-news/assets/saturn-cassini.jpg` 基于 NASA 提供的 1536 像素图像制作，非 AI 绘制，现用作不支持 WebGL 时的静态回退图。图片署名：NASA/JPL/Space Science Institute。媒体使用遵循 [JPL 图像使用政策](https://www.jpl.nasa.gov/jpl-image-use-policy/)；本站不表示 NASA、JPL 或加州理工学院认可或支持本项目。此图片不适用本仓库自定义代码的 GPL 许可证。
- [WP-CLI](https://github.com/wp-cli/wp-cli)：WordPress 命令行工具，MIT；部署基线 2.12.0，安装使用官方发布物及 SHA-256 校验。
- [Slim SEO](https://wordpress.org/plugins/slim-seo/)：SEO 元信息与 sitemap，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- [Limit Login Attempts Reloaded](https://wordpress.org/plugins/limit-login-attempts-reloaded/)：登录重试限制，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- Nginx、PHP、MySQL：使用 Ubuntu 和服务器既有软件源，保留各自许可证。

`chenjin-news` 子主题与自定义插件由本项目维护，未复制第三方付费主题、字体、图标包或图库。所有项目下载链接指向原始 GitHub 仓库，其源码和发布包遵守各自许可证。
