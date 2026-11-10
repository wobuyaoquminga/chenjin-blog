<?php
/** WordPress search result archive. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<section class="view active" data-view="search">
    <div class="wrap">
        <div class="page-head">
            <h1 class="sec-title shine">搜索</h1>
            <p class="sec-sub">关键词：<?php echo esc_html( get_search_query( false ) ); ?></p>
        </div>
        <div class="toolbar">
            <form class="searchbox" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
                <input type="search" name="s" placeholder="继续搜索…" aria-label="继续搜索" value="<?php echo esc_attr( get_search_query( false ) ); ?>" required>
            </form>
        </div>
        <?php if ( have_posts() ) : ?>
            <div class="grid p1 muse-article-list">
                <?php while ( have_posts() ) : the_post(); chenjin_muse_post_card(); endwhile; ?>
            </div>
            <?php chenjin_muse_pagination(); ?>
        <?php else : ?>
            <div class="empty">没有找到相关内容，换个关键词试试。</div>
        <?php endif; ?>
    </div>
</section>
<?php get_footer(); ?>
