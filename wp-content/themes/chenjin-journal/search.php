<?php get_header(); ?>
<div class="container archive-layout"><header class="page-heading"><p class="eyebrow">SEARCH</p><h1>搜索<span class="accent">.</span></h1><?php get_search_form(); ?></header>
	<?php if ( have_posts() ) : ?><p class="result-count">“<?php echo esc_html( get_search_query() ); ?>”的搜索结果</p><div class="post-grid"><?php while ( have_posts() ) : the_post(); ws_journal_post_card(); endwhile; ?></div><div class="pagination"><?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => '← 上一页', 'next_text' => '下一页 →' ) ); ?></div><?php else : ?><div class="empty-state"><span aria-hidden="true">⌕</span><h2>没有找到相关内容</h2><p>换个关键词，再试一次。</p></div><?php endif; ?>
</div>
<?php get_footer(); ?>
