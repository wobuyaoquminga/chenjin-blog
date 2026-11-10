<?php
/** Muse's lost planet with live site routes. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$posts_page = (int) get_option( 'page_for_posts' );
?>
<section class="view active" data-view="notfound">
    <div class="wrap muse-notfound">
        <div class="lost-planet" aria-hidden="true"></div>
        <h1 class="sec-title">这颗星上什么都没有</h1>
        <p class="links"><a class="btn gold" href="<?php echo esc_url( home_url( '/' ) ); ?>">返回首页</a><a class="btn" href="<?php echo esc_url( $posts_page ? get_permalink( $posts_page ) : home_url( '/articles/' ) ); ?>">浏览文章</a><a class="btn" href="<?php echo esc_url( home_url( '/projects/' ) ); ?>">查看项目</a></p>
    </div>
</section>
<?php get_footer(); ?>
