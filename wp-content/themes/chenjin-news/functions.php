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
    if ( is_singular( 'post' ) ) {
        wp_enqueue_script( 'chenjin-news-reading', get_stylesheet_directory_uri() . '/reading.js', array(), $version . '.' . filemtime( get_stylesheet_directory() . '/reading.js' ), true );
    }
}, 20 );

function chenjin_news_navigation() {
    echo '<ul class="cjn-nav-list">';
    foreach ( array( '首页' => '/', '文章' => '/articles/', '项目资源' => '/projects/', '关于' => '/about/', '站内联系' => '/contact/' ) as $label => $path ) {
        echo '<li><a href="' . esc_url( home_url( $path ) ) . '">' . esc_html( $label ) . '</a></li>';
    }
    echo '</ul>';
}

function chenjin_news_intro() {
    $front = ! empty( $GLOBALS['chenjin_news_front'] );
    ?>
    <div class="chenjin-news-intro">
        <p class="chenjin-news-label">陈今 · 个人博客</p>
        <h1><?php echo $front ? '记录开发，分享创作。' : '文章与记录'; ?></h1>
        <p>技术笔记、开源项目，以及值得留下的想法。</p>
        <a href="<?php echo esc_url( home_url( '/projects/' ) ); ?>">浏览全部开源项目与资源 <span aria-hidden="true">→</span></a>
    </div>
    <?php
}
add_action( 'blocksy:archive:top', function () {
    if ( is_home() ) { chenjin_news_intro(); }
} );

// Decorative local covers for posts without an uploaded featured image.
add_filter( 'post_thumbnail_html', function ( $html, $post_id ) {
    if ( $html || ( is_singular() && empty( $GLOBALS['chenjin_news_front'] ) ) ) { return $html; }
    $slug = get_post_field( 'post_name', $post_id );
    $cover = in_array( $slug, array( 'diandian-counter', 'chatapp-secure' ), true ) ? $slug : 'journal';
    return '<a class="chenjin-news-cover" href="' . esc_url( get_permalink( $post_id ) ) . '" aria-label="' . esc_attr( get_the_title( $post_id ) ) . '"><img src="' . esc_url( get_stylesheet_directory_uri() . '/assets/' . $cover . '.svg' ) . '" alt="" width="960" height="540" loading="lazy"></a>';
}, 10, 2 );

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
