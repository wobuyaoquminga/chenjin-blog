<?php
/** WP-CLI: configure only once, so future source updates retain owner's Customizer settings. */
if ( get_option( 'chenjin_news_configured' ) ) { return; }
if ( get_stylesheet() !== 'chenjin-news' || ! function_exists( 'blocksy_get_theme_mod' ) ) {
    WP_CLI::error( 'Activate chenjin-news with the official Blocksy parent first.' );
}
foreach ( array( 'blog', 'categories', 'search', 'author' ) as $prefix ) {
    set_theme_mod( $prefix . '_structure', 'grid' );
    set_theme_mod( $prefix . '_columns', array( 'desktop' => 2, 'tablet' => 2, 'mobile' => 1 ) );
    set_theme_mod( $prefix . '_card_type', 'boxed' );
    set_theme_mod( $prefix . '_has_sidebar', 'no' );
    set_theme_mod( $prefix . '_archive_order', array(
        array( 'id' => 'featured_image', 'enabled' => true, 'thumb_ratio' => '16/9', 'is_boundless' => 'yes', 'image_size' => 'large', 'has_link' => 'yes' ),
        array( 'id' => 'post_meta', '__id' => 'meta_1', 'enabled' => true, 'meta_type' => 'simple', 'meta_divider' => 'slash', 'meta_elements' => array( array( 'id' => 'categories', 'enabled' => true ), array( 'id' => 'post_date', 'enabled' => true ) ) ),
        array( 'id' => 'title', 'enabled' => true, 'heading_tag' => 'h2', 'has_link' => 'yes' ),
        array( 'id' => 'excerpt', 'enabled' => true, 'excerpt_length' => 55 ),
        array( 'id' => 'read_more', 'enabled' => true, 'button_type' => 'simple', 'read_more_text' => '阅读全文', 'read_more_arrow' => 'yes' ),
    ) );
}
set_theme_mod( 'blog_hero_enabled', 'no' );
set_theme_mod( 'single_blog_post_has_author_box', 'no' );
set_theme_mod( 'single_blog_post_has_share_box', 'no' );
$palette = array( '#2872fa', '#1559ed', '#4b5563', '#1b2533', '#e5e9ef', '#f7f8fa', '#f7f8fa', '#ffffff' );
$colors = array();
foreach ( $palette as $i => $color ) { $colors['color' . ( $i + 1 )] = array( 'color' => $color ); }
set_theme_mod( 'colorPalette', $colors );
$menu = wp_get_nav_menu_object( '陈今导航' );
if ( ! $menu ) {
    $id = wp_create_nav_menu( '陈今导航' );
    if ( is_wp_error( $id ) ) { WP_CLI::error( $id->get_error_message() ); }
    foreach ( array( '首页' => '/', '文章' => '/articles/', '项目资源' => '/projects/', '关于' => '/about/', '站内联系' => '/contact/' ) as $label => $path ) {
        wp_update_nav_menu_item( $id, 0, array( 'menu-item-title' => $label, 'menu-item-url' => home_url( $path ), 'menu-item-type' => 'custom', 'menu-item-status' => 'publish' ) );
    }
} else { $id = $menu->term_id; }
set_theme_mod( 'nav_menu_locations', array( 'menu_1' => $id, 'menu_mobile' => $id ) );
update_option( 'chenjin_news_configured', 1, false );
update_option( 'date_format', 'Y.m.d' );
WP_CLI::success( 'News layout configured. Articles, pages and private messages retained.' );
