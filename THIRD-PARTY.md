# 第三方来源

- [WordPress](https://github.com/WordPress/WordPress)：成熟博客/CMS 内核，GPL-2.0-or-later，官方发布包通过 WordPress 官方下载渠道安装；部署基线 7.1.2。
- [Blocksy](https://wordpress.org/themes/blocksy/)：`chenjin-news` 新闻风格子主题所依赖的父主题，从 WordPress 官方主题目录安装并开启官方更新；许可证以官方主题包声明为准。
- [Blocksy News](https://creativethemes.com/blocksy/starter-site/news/)：所选的外观参考；使用父主题的原生文章卡片配置布局，未导入演示文章、第三方表单或图库。
- Muse 银河视觉：用户授权下载并提供的自包含 HTML 设计已接入本项目的 WordPress 模板和样式。该来源说明不替代 Muse 原始素材的许可文件，也不对其另行推断许可证。
- [Three.js r186](https://github.com/mrdoob/three.js/tree/r186)：`wp-content/themes/chenjin-news/assets/vendor/muse-three.js` 来自上述 Muse 源码，文件内部自报 revision 186；MIT 许可文本保留在 `assets/vendor/THREE-LICENSE.txt`。这与旧版使用的 r187 不同。
- [Noto Serif SC](https://fonts.google.com/noto/specimen/Noto+Serif+SC)：本地字体子集位于 `assets/fonts/`，随目录保留 Google Fonts 提供的 `OFL.txt`。
- [Solar System Scope 行星贴图](https://www.solarsystemscope.com/textures/)：旧版使用的本地 2K 素材仍保存在 `assets/textures/`，当前三维场景的行星表面由程序生成，不读取这些图片。历史素材依据 NASA 数据制作并按 CC BY 4.0 发布；部分区域由素材作者补绘，署名与许可见[素材页面](https://www.solarsystemscope.com/textures/)。
- [卡西尼号土星照片 PIA06193](https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/)：`assets/saturn-cassini.jpg` 基于 NASA/JPL/Space Science Institute 图片制作，当前作为无脚本静态回退图保留。媒体使用遵循 [JPL 图像使用政策](https://www.jpl.nasa.gov/jpl-image-use-policy/)；本站不表示这些机构认可本项目。此图片不属于本仓库自定义代码的 GPL 授权范围。
- [WP-CLI](https://github.com/wp-cli/wp-cli)：WordPress 命令行工具，MIT；部署基线 2.12.0，安装使用官方发布物及 SHA-256 校验。
- [Slim SEO](https://wordpress.org/plugins/slim-seo/)：SEO 元信息与 sitemap，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- [Limit Login Attempts Reloaded](https://wordpress.org/plugins/limit-login-attempts-reloaded/)：登录重试限制，由 WordPress 官方插件目录安装，许可以插件包声明为准。
- Nginx、PHP、MySQL：使用 Ubuntu 和服务器既有软件源，保留各自许可证。

`chenjin-news` 子主题与自定义插件由本项目维护。所有项目下载链接指向原始 GitHub 仓库，其源码和发布包遵守各自许可证。
