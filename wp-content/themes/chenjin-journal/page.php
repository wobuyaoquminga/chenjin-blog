<?php get_header(); ?>
<?php while ( have_posts() ) : the_post(); ?>
<article <?php post_class( 'page-content container-narrow' ); ?>><header class="page-heading"><p class="eyebrow">CHENJIN / PAGE</p><h1><?php echo esc_html( get_the_title() ); ?><span class="accent">.</span></h1><?php if ( has_excerpt() ) : ?><p><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?></header><?php if ( has_post_thumbnail() ) : ?><div class="page-cover"><?php the_post_thumbnail( 'full' ); ?></div><?php endif; ?><div class="entry-content"><?php the_content(); ?></div><?php wp_link_pages( array( 'before' => '<nav class="page-links" aria-label="页面分页">', 'after' => '</nav>' ) ); ?><?php if ( comments_open() || get_comments_number() ) { comments_template(); } ?></article>
<?php endwhile; ?>
<?php get_footer(); ?>
