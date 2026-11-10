<?php
/** Native posts index. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$posts_page  = (int) get_option( 'page_for_posts' );
$articles_url = $posts_page ? get_permalink( $posts_page ) : home_url( '/articles/' );
get_header();
?>
<section class="view active" data-view="articles">
    <div class="wrap">
        <div class="page-head">
            <h1 class="sec-title shine">文章</h1>
        </div>
        <div class="toolbar">
            <form class="searchbox" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
                <input type="search" name="s" placeholder="搜索文章…" aria-label="搜索文章" required>
            </form>
            <div class="muse-category-chips" role="group" aria-label="文章分类">
                <a class="chip on" href="<?php echo esc_url( $articles_url ); ?>" aria-current="page">全部</a>
                <?php foreach ( get_categories( array( 'hide_empty' => true ) ) as $category ) : ?>
                    <a class="chip" href="<?php echo esc_url( get_category_link( $category->term_id ) ); ?>"><?php echo esc_html( $category->name ); ?></a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php if ( have_posts() ) : ?>
            <div class="grid p1 muse-article-list">
                <?php while ( have_posts() ) : the_post(); chenjin_muse_post_card(); endwhile; ?>
            </div>
            <?php chenjin_muse_pagination(); ?>
        <?php else : ?>
            <div class="empty">目前还没有文章。</div>
        <?php endif; ?>
    </div>
</section>
<?php get_footer(); ?>
