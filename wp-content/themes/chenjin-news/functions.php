<?php
/** Preserve the mature parent's templates and add only site-specific presentation. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

// Pagination belongs to the native article archive, not the static homepage.
add_action( 'template_redirect', function () {
    $page = max( (int) get_query_var( 'paged' ), (int) get_query_var( 'page' ) );
    if ( is_front_page() && $page > 1 && get_option( 'page_for_posts' ) ) {
        wp_safe_redirect( trailingslashit( get_permalink( (int) get_option( 'page_for_posts' ) ) ) . 'page/' . $page . '/', 301 );
        exit;
    }
}, 5 );

add_action( 'wp_enqueue_scripts', function () {
    $version = wp_get_theme()->get( 'Version' );
    wp_enqueue_style( 'chenjin-news', get_stylesheet_uri(), array( 'ct-main-styles' ), $version . '.' . filemtime( get_stylesheet_directory() . '/style.css' ) );
    wp_enqueue_script( 'chenjin-news-motion', get_stylesheet_directory_uri() . '/motion.js', array(), $version . '.' . filemtime( get_stylesheet_directory() . '/motion.js' ), true );
    if ( is_front_page() ) {
        wp_enqueue_script( 'chenjin-solar-system', get_stylesheet_directory_uri() . '/solar-system.min.js', array(), $version . '.' . filemtime( get_stylesheet_directory() . '/solar-system.min.js' ), true );
    }
    if ( is_singular( 'post' ) ) {
        wp_enqueue_script( 'chenjin-news-reading', get_stylesheet_directory_uri() . '/reading.js', array(), $version . '.' . filemtime( get_stylesheet_directory() . '/reading.js' ), true );
    }
}, 20 );

add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( 'chenjin-solar-system' !== $handle ) { return $tag; }
    $tag = preg_replace( '/\s+type=([\'\"]).*?\1/', '', $tag );
    return str_replace( '<script ', '<script type="module" ', $tag );
}, 10, 2 );

function chenjin_news_navigation() {
    echo '<ul class="cjn-nav-list">';
    foreach ( array( '首页' => '/', '文章' => '/articles/', '项目资源' => '/projects/', '关于' => '/about/', '站内联系' => '/contact/' ) as $label => $path ) {
        echo '<li><a href="' . esc_url( home_url( $path ) ) . '">' . esc_html( $label ) . '</a></li>';
    }
    echo '</ul>';
}

function chenjin_news_intro() {
    echo '<header class="chenjin-news-intro"><h1>文章</h1></header>';
}
add_action( 'blocksy:archive:top', function () {
    if ( is_home() ) { chenjin_news_intro(); }
} );

add_filter( 'blocksy:footer:copyright:value', function () {
    $number = get_option( 'chenjin_icp_number', '' );
    $filing = is_string( $number ) && $number !== '' ? '<a href="https://beian.miit.gov.cn/">' . esc_html( $number ) . '</a>' : '';
    return '© {current_year} 陈今' . '<a href="' . esc_url( home_url( '/privacy/' ) ) . '">隐私说明</a><a href="' . esc_url( home_url( '/contact/' ) ) . '">站内联系</a><a href="' . esc_url( get_feed_link() ) . '">RSS</a>' . $filing;
} );

add_action( 'admin_init', function () {
    register_setting( 'general', 'chenjin_icp_number', array( 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field', 'default' => '' ) );
    add_settings_field( 'chenjin_icp_number', '网站备案号', function () {
        echo '<input class="regular-text" type="text" id="chenjin_icp_number" name="chenjin_icp_number" value="' . esc_attr( get_option( 'chenjin_icp_number', '' ) ) . '"><p class="description">按已获批的备案信息填写，留空则不显示。公开源码不包含此配置。</p>';
    }, 'general', 'default', array( 'label_for' => 'chenjin_icp_number' ) );
} );

add_action( 'wp_head', function () {
    if ( ! has_site_icon() ) {
        echo '<link rel="icon" type="image/svg+xml" href="' . esc_url( add_query_arg( 'v', wp_get_theme()->get( 'Version' ), get_stylesheet_directory_uri() . '/assets/icon.svg' ) ) . '">';
    }
} );
