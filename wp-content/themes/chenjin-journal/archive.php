<?php get_header(); ?>
<div class="container archive-layout"><header class="page-heading"><p class="eyebrow">ARCHIVE</p><h1><?php the_archive_title(); ?><span class="accent">.</span></h1><?php if ( get_the_archive_description() ) : ?><div class="archive-description"><?php the_archive_description(); ?></div><?php endif; ?></header>
	<?php if ( have_posts() ) : ?><div class="post-grid"><?php while ( have_posts() ) : the_post(); ws_journal_post_card(); endwhile; ?></div><div class="pagination"><?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => '← 上一页', 'next_text' => '下一页 →' ) ); ?></div><?php else : ?><div class="empty-state"><p>这里还没有文章。</p></div><?php endif; ?>
</div>
<?php get_footer(); ?>
