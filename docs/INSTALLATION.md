# 在已有 WordPress 中安装

此方式安装主题和插件，不需要运行仓库中的服务器安装脚本。先备份现有站点，优先在测试站点试用。

## 1. 准备组件

从 [最新发布页](https://github.com/wobuyaoquminga/chenjin-blog/releases/latest) 下载 News 子主题和两个插件 ZIP，核对发布页实际版本。4.0.0 组件组合为 `chenjin-news` 4.0.0、`chenjin-github` 1.2.0、`chenjin-contact` 1.0.0。父主题 Blocksy 从 WordPress 官方主题目录安装，不包含在本仓库发布包中。

当前验证环境为 WordPress 7.1.4、Blocksy 2.1.61、PHP 8.3；子主题声明要求 WordPress 6.7+ 与 PHP 7.4+，声明最低要求不等于每种环境都已验收。

## 2. 替换项目账号

默认项目账号位于 `wp-content/plugins/chenjin-github/chenjin-github.php`：

```php
const WS_GITHUB_USER = 'wobuyaoquminga';
```

将字符串替换为自己的 GitHub 用户名。当前后台用于查看同步状态与手动同步，不提供账号编辑。可以先解压插件 ZIP，修改这一行，再将 `chenjin-github` 目录打包并上传；未来升级同样需要保留这项定制。

插件使用公开 API，不需要 GitHub token，只收录公开仓库。自己的仓库为空或 GitHub 暂不可达时不会创建虚构项目。

## 3. 上传与启用

1. 在「外观 → 主题 → 添加主题」搜索并安装 **Blocksy**。
2. 上传 `chenjin-news` 子主题 ZIP，启用 **Chenjin News**。
3. 在「插件 → 添加插件 → 上传插件」分别上传并启用 GitHub 项目和站内联系插件。

子主题只包含样式、阅读辅助和本站封面，不包含 WordPress 内核或数据库。站内联系插件停用后数据仍留在数据库，重新启用可查看；删除数据应通过后台「站内来信」处理。

## 4. 建立页面

创建并发布以下页面，使用对应固定链接别名：

- `home`：首页，正文可留空，子主题显示最新文章。
- `articles`：文章页，正文留空，由 WordPress 显示原生文章归档。
- `projects`：项目页，添加短代码区块 `[ws_projects]`；站内详情使用同一页的 `?project=仓库名` 查询参数。
- `contact`：联系页，添加短代码区块 `[chenjin_contact]`。
- `about`：填写自己的介绍。
- `privacy`：根据实际部署说明评论、联系、Cookie 和访问日志等数据处理。

在「设置 → 阅读」选择静态首页，将首页设为 `home`、文章页设为 `articles`。在「设置 → 固定链接」选择文章名结构。将隐私页面设置为本站隐私政策页。

`projects`、`contact`、`articles`、`privacy` 路径用于子主题导航和联系表单跳转，修改路径需要同步调整主题/插件中的对应链接。联系短代码放在其他路径时也应保留 `/contact/` 页面作为提交结果入口。

## 5. 配置主题导航与可选文章卡片

站点名称在「设置 → 常规」维护，Logo 使用「外观 → 自定义」的站点标识。创建 WordPress 菜单并分配到 `menu_1` 主导航位置。金色、冰蓝和紫色银河皮肤、页头页脚及导航交互由子主题维护，部分 Blocksy 页头外观选项不会生效。

已获批的备案号可在「设置 → 常规 → 网站备案号」填写，页脚会自动展示；发布包不包含演示站点的备案配置。

有 WP-CLI 时，可在创建页面并启用子主题后运行一次：

```bash
wp --path=/your/wordpress/path eval-file /path/to/chenjin-blog/deploy/configure-news.php
```

该命令可初始化部分 Blocksy 文章卡片样式，**不会导入旧浅色模板，也不负责子主题整体皮肤或导航交互**。它不创建页面和文章；初始化标记存在时再次运行会跳过。

演示品牌“陈今”、首页标题和默认装饰封面来自子主题代码；复用时可在 `header.php`、`front-page.php`、`footer.php`、`assets/` 与站点设置中替换。不要修改 Blocksy 父主题文件。Muse 外观已写入 WordPress 模板，页面中的文章和项目仍读取真实站点数据。

## 6. 同步与收件

进入「设置 → GitHub 项目」点击「立即同步」。发布一个项目页后检查仓库、站内详情、Release、附件链接和筛选状态。站内详情仅允许访问已同步公开仓库缓存，不用于查看私有或任意仓库；示例路径为 `/projects/?project=chenjin-blog`。若首次同步失败，后台显示错误；网络恢复后再次同步。

每小时事件由 WordPress Cron 调度。低访问量站点如需固定频率，应由服务器定时执行到期 Cron 事件；不要重复注册大量任务。

通过联系页提交一条测试来信，在后台「站内来信」确认可见，然后删除测试数据。来信不发送邮箱，只有具备管理员管理权限的账号可以查看。

## 7. 更新

更新前备份数据库和 `wp-content`。Blocksy 父主题通过官方渠道更新；自定义子主题和插件使用本仓库发布包更新，保留自己的 GitHub 用户名与品牌修改。页面、文章和来信存储在数据库中，覆盖主题文件不会迁移这些数据。

如需完整 Ubuntu/Nginx 运维方案，继续阅读 [服务器部署说明](DEPLOYMENT.md)；该脚本包含演示部署环境的专用配置，不能直接应用到任意服务器。
