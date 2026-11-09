<?php
/** The public shell keeps WordPress and Blocksy content hooks available. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?> <?php echo blocksy_html_attr(); ?>>
<head>
    <?php do_action( 'blocksy:head:start' ); ?>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b0d12">
    <?php wp_head(); ?>
    <?php do_action( 'blocksy:head:end' ); ?>
</head>
<body <?php body_class(); ?> <?php echo blocksy_body_attr(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main">跳转到正文</a>
<div class="cjn-progress" aria-hidden="true"><span></span></div>
<div id="main-container">
    <?php do_action( 'blocksy:header:before' ); ?>
    <header class="cjn-header">
        <div class="cjn-shell">
            <a class="cjn-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="陈今的博客，返回首页">
                <span class="cjn-brand-mark" aria-hidden="true"><?php
                    $logo = (int) get_theme_mod( 'custom_logo' );
                    echo $logo ? wp_get_attachment_image( $logo, 'thumbnail', false, array( 'alt' => '' ) ) : '今';
                ?></span>
                <span class="cjn-brand-name">陈今</span>
            </a>
            <nav id="cjn-nav" class="cjn-nav" aria-label="主导航">
                <?php wp_nav_menu( array(
                    'theme_location' => 'menu_1',
                    'container' => false,
                    'menu_class' => 'cjn-nav-list',
                    'fallback_cb' => 'chenjin_news_navigation',
                    'depth' => 2,
                ) ); ?>
            </nav>
            <div class="cjn-header-actions">
                <button class="cjn-icon-button" type="button" data-cjn-search aria-label="搜索文章" aria-controls="cjn-search" aria-expanded="false">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
                </button>
                <button class="cjn-icon-button cjn-menu-button" type="button" data-cjn-menu-toggle aria-label="打开导航菜单" aria-controls="cjn-nav" aria-expanded="false">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                </button>
            </div>
        </div>
        <noscript><form class="cjn-noscript-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>"><label>搜索文章 <input type="search" name="s" required></label><button type="submit">搜索</button></form></noscript>
        <form id="cjn-search" class="cjn-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" hidden>
            <label for="cjn-search-input">搜索文章</label>
            <input id="cjn-search-input" type="search" name="s" placeholder="输入想找的内容…" value="<?php echo esc_attr( get_search_query() ); ?>" required>
            <button type="submit">搜索 <span aria-hidden="true">↗</span></button>
        </form>
    </header>
    <?php do_action( 'blocksy:header:after' ); do_action( 'blocksy:content:before' ); ?>
    <main <?php echo blocksy_main_attr(); ?> tabindex="-1">
    <?php do_action( 'blocksy:content:top' ); blocksy_before_current_template(); ?>
