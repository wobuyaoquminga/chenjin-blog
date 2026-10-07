<?php get_header(); ?>
<?php while ( have_posts() ) : the_post(); ?>
<article <?php post_class( 'article-page' ); ?>>
	<header class="article-header container-narrow">
		<a class="back-link" href="<?php echo esc_url( ws_journal_posts_url() ); ?>">← 返回文章</a>
		<div class="eyebrow"><?php echo esc_html( get_the_date( 'Y.m.d' ) ); ?> <span aria-hidden="true">/</span> <?php echo esc_html( get_the_author() ); ?></div>
		<h1><?php echo esc_html( get_the_title() ); ?></h1>
		<?php if ( has_excerpt() ) : ?><p class="article-deck"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
		<?php if ( has_category() ) : ?><div class="article-categories"><?php the_category( ' ' ); ?></div><?php endif; ?>
	</header>
	<?php if ( has_post_thumbnail() ) : ?><div class="article-cover container"><?php the_post_thumbnail( 'full' ); ?></div><?php endif; ?>
	<div class="article-layout container">
		<aside class="article-sidebar"><div class="toc" hidden><p class="toc__label">本文目录</p><nav aria-label="本文目录"><ol></ol></nav></div></aside>
		<div class="article-content-wrap"><div class="entry-content" id="article-content"><?php the_content(); ?></div>
			<?php wp_link_pages( array( 'before' => '<nav class="page-links" aria-label="文章分页">', 'after' => '</nav>' ) ); ?>
			<?php $tags = get_the_tags(); if ( $tags ) : ?><div class="article-tags"><span>标签</span><?php foreach ( $tags as $tag ) : ?><a href="<?php echo esc_url( get_tag_link( $tag->term_id ) ); ?>">#<?php echo esc_html( $tag->name ); ?></a><?php endforeach; ?></div><?php endif; ?>
			<?php $previous = get_previous_post(); $next = get_next_post(); if ( $previous || $next ) : ?><nav class="post-navigation" aria-label="相邻文章"><div><?php if ( $previous ) : ?><a href="<?php echo esc_url( get_permalink( $previous ) ); ?>"><span>← 上一篇</span><strong><?php echo esc_html( get_the_title( $previous ) ); ?></strong></a><?php endif; ?></div><div><?php if ( $next ) : ?><a href="<?php echo esc_url( get_permalink( $next ) ); ?>"><span>下一篇 →</span><strong><?php echo esc_html( get_the_title( $next ) ); ?></strong></a><?php endif; ?></div></nav><?php endif; ?>
			<?php if ( comments_open() || get_comments_number() ) { comments_template(); } ?>
		</div>
	</div>
</article>
<?php endwhile; ?>
<?php get_footer(); ?>
