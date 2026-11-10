<?php
/** Muse's visual shell, preserving native WordPress and Blocksy hooks. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?> <?php echo blocksy_html_attr(); ?>>
<head>
<?php do_action( 'blocksy:head:start' ); ?>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#030510">
<?php wp_head(); do_action( 'blocksy:head:end' ); ?>
</head>
<body <?php body_class(); ?> <?php echo blocksy_body_attr(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main">跳转到正文</a>
<div id="nebula" aria-hidden="true"></div><canvas id="dust" aria-hidden="true"></canvas>
<div id="vignette" aria-hidden="true"></div><div id="warp" aria-hidden="true"></div>
<div id="readProgress" class="cjn-progress" aria-hidden="true"><span></span></div>
<div id="main-container">
<?php do_action( 'blocksy:header:before' ); ?>
<header class="nav cjn-header">
 <?php if ( has_custom_logo() ) : ?><?php the_custom_logo(); ?><?php else : ?>
 <a class="brand cjn-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="陈今的博客，返回首页">陈今<em>的博客</em></a>
 <?php endif; ?>
 <button class="icon-btn cjn-menu-button" id="menuBtn" type="button" data-cjn-menu-toggle aria-label="打开导航菜单" aria-controls="cjn-nav" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
 <nav class="main cjn-nav" id="cjn-nav" aria-label="主导航">
 <?php wp_nav_menu( array( 'theme_location'=>'menu_1', 'container'=>false, 'menu_class'=>'cjn-nav-list', 'fallback_cb'=>'chenjin_news_navigation', 'depth'=>2 ) ); ?>
 </nav>
 <button class="icon-btn cjn-icon-button" id="searchBtn" type="button" data-cjn-search aria-label="搜索文章" aria-controls="cjn-search" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg><span class="txt">搜索文章</span></button>
</header>
<form id="cjn-search" class="cjn-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" hidden>
 <label class="screen-reader-text" for="cjn-search-input">搜索文章</label>
 <input id="cjn-search-input" type="search" name="s" placeholder="搜索文章…" aria-label="搜索文章" value="<?php echo esc_attr( get_search_query() ); ?>" required><button class="btn gold small" type="submit">搜索</button>
</form>
<noscript><style>header.nav{position:relative;height:auto;flex-wrap:wrap;padding-block:12px}nav.main{display:flex!important;position:static;flex-basis:100%}nav.main .cjn-nav-list{flex-wrap:wrap;flex-direction:row}#menuBtn,#searchBtn{display:none}.hero{padding-top:0}.cjn-noscript-search{padding:15px}.cjn-noscript-search input{background:#0a1230;color:#edf1f8;border:1px solid #29334e}</style><form class="cjn-noscript-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>"><label>搜索文章 <input type="search" name="s" required></label><button type="submit">搜索</button></form></noscript>
<?php do_action( 'blocksy:header:after' ); do_action( 'blocksy:content:before' ); ?>
<main <?php echo blocksy_main_attr(); ?> tabindex="-1">
<?php do_action( 'blocksy:content:top' ); blocksy_before_current_template(); ?>
