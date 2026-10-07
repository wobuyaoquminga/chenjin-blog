<?php
/** Initial real site pages. Reruns preserve content edited by the owner. */
function ws_seed_page( $slug, $title, $content ) {
    $existing = get_page_by_path( $slug );
    if ( $existing ) {
        return $existing->ID;
    }
    return wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => $slug, 'post_title' => $title, 'post_content' => $content, 'comment_status' => 'closed' ), true );
}
$home = ws_seed_page( 'home', '首页', '' );
$articles = ws_seed_page( 'articles', '文章', '' );
ws_seed_page( 'projects', '开源项目与资源', '[ws_projects]' );
ws_seed_page( 'contact', '联系陈今', '[chenjin_contact]' );
ws_seed_page( 'about', '关于我', '<h2>你好，我是陈今。</h2><p>这里记录开发与创作，也分享我的开源项目与资源。</p><h2>联系我</h2><p>通过<a href="/blog/contact/">站内联系页面</a>给我留言，留言仅由站长在后台查看。</p>' );
ws_seed_page( 'privacy', '隐私说明', '<h2>本站收集什么</h2><p>浏览本站无需注册。评论功能保存你填写的昵称、邮箱、正文以及 IP 和浏览器标识，用于审核和滥用防护，邮箱不公开。站内联系表单只收集自愿填写的昵称、主题和正文，来信仅管理员可见，不收集邮箱或保存访客 IP；防刷计数使用临时匿名哈希。</p><h2>Cookie 与外部链接</h2><p>后台登录使用必要 Cookie，主题偏好存于浏览器。本站无第三方统计或 Gravatar 头像。项目链接与下载指向 GitHub，适用其隐私政策。</p><h2>删除与联系</h2><p>请通过<a href="/blog/contact/">站内联系</a>联系站长。服务器访问日志用于运维和安全。</p>' );
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home );
update_option( 'page_for_posts', $articles );
$privacy = get_page_by_path( 'privacy' );
update_option( 'wp_page_for_privacy_policy', $privacy->ID );
// Useful factual project introductions, with sources; no invented personal history.
$introductions = array(
    'diandian-counter' => array( '点点计数：离线计数与历史记录', '<p>点点计数是一个简洁的离线计数器，支持任务、历史记录与 Android 应用。你可以按任务记录数量，并回看之前保存的记录。</p><h2>获取与使用</h2><p>源码、使用说明、Android 安装包和版本校验信息以项目仓库与 Releases 为准。</p><p><a href="https://github.com/wobuyaoquminga/diandian-counter">阅读 README 与源码</a> · <a href="https://github.com/wobuyaoquminga/diandian-counter/releases">下载发布版本</a></p><h2>关于这篇介绍</h2><p>本文整理自项目的公开说明。项目后续更新请查看仓库；博客的项目资源页会定时同步公开仓库列表。</p>' ),
    'chatapp-secure' => array( 'Chat：可自行部署的一对一通讯项目', '<p>Chat 是一个可自行部署的一对一通讯项目，提供 Windows 客户端、Android 客户端和 Java 服务器，包含加密消息、联系人确认、文件传输以及语音和视频通话。</p><h2>获取资源</h2><p><a href="https://github.com/wobuyaoquminga/chatapp-secure">项目源码与说明</a> · <a href="https://github.com/wobuyaoquminga/chatapp-secure/releases">客户端与服务器发布包</a></p><h2>使用前阅读</h2><p>当前项目为开发验证版。通信能力、账号与数据保留规则、部署步骤和验证范围，请以仓库 README 与对应版本文档为准。</p><h2>资料来源</h2><p>本文整理自项目公开说明，保留原项目的能力与验证边界。最新功能和修复请查看 GitHub 发布记录。</p>' ),
);
$category = get_term_by( 'slug', 'project-notes', 'category' );
if ( ! $category ) {
    $created = wp_insert_term( '项目笔记', 'category', array( 'slug' => 'project-notes' ) );
    $category_id = is_wp_error( $created ) ? 1 : $created['term_id'];
} else {
    $category_id = $category->term_id;
}
foreach ( $introductions as $slug => $info ) {
    if ( get_page_by_path( $slug, OBJECT, 'post' ) ) { continue; }
    wp_insert_post( array( 'post_type' => 'post', 'post_status' => 'publish', 'post_name' => $slug, 'post_title' => $info[0], 'post_content' => $info[1], 'post_category' => array( $category_id ), 'tags_input' => array( '开源', '项目资源' ), 'comment_status' => 'open', 'post_author' => 1 ) );
}
echo "Site pages initialized.\n";
