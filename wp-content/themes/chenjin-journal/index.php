<?php get_header(); ?>
<div class="container archive-layout">
	<header class="page-heading"><p class="eyebrow">THE JOURNAL</p><h1><?php echo is_home() && get_option( 'page_for_posts' ) ? esc_html( get_the_title( (int) get_option( 'page_for_posts' ) ) ) : '文章'; ?><span class="accent">.</span></h1><p>记录思考与发现。</p></header>
	<?php if ( have_posts() ) : ?><div class="post-grid"><?php while ( have_posts() ) : the_post(); ws_journal_post_card(); endwhile; ?></div><div class="pagination"><?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => '← 上一页', 'next_text' => '下一页 →' ) ); ?></div><?php else : ?><div class="empty-state"><p>还没有文章。</p></div><?php endif; ?>
</div>
<?php get_footer(); ?>
