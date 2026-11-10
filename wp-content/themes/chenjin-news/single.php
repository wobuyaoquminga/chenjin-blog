<?php
/** Read a real WordPress article and use WordPress comments. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$posts_page = (int) get_option( 'page_for_posts' );
$articles_url = $posts_page ? get_permalink( $posts_page ) : home_url( '/articles/' );
?>
<section class="view active" data-view="article">
    <div class="wrap">
        <?php while ( have_posts() ) : the_post(); ?>
            <header class="page-head">
                <p><a href="<?php echo esc_url( $articles_url ); ?>">← 全部文章</a></p>
                <h1 class="sec-title muse-post-title"><?php echo esc_html( get_the_title() ); ?></h1>
                <div class="meta">
                    <span class="m"><time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time></span>
                    <?php $categories = get_the_category(); if ( $categories ) : ?>
                        <span class="m"><a href="<?php echo esc_url( get_category_link( $categories[0]->term_id ) ); ?>"><?php echo esc_html( $categories[0]->name ); ?></a></span>
                    <?php endif; ?>
                </div>
            </header>
            <div class="article-layout">
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'post-body entry-content' ); ?>>
                    <?php if ( has_post_thumbnail() ) : ?><figure class="muse-post-cover"><?php the_post_thumbnail( 'large' ); ?></figure><?php endif; ?>
                    <?php the_content(); wp_link_pages( array( 'before' => '<nav class="muse-pagination" aria-label="文章分页">', 'after' => '</nav>' ) ); ?>
                </article>
                <aside class="toc" id="postToc" aria-label="文章目录"><b>本文目录</b></aside>
            </div>
            <?php $previous = get_previous_post(); $next = get_next_post(); ?>
            <?php if ( $previous || $next ) : ?>
                <nav class="prevnext" aria-label="相邻文章">
                    <?php if ( $previous ) : ?><a href="<?php echo esc_url( get_permalink( $previous ) ); ?>"><small>上一篇</small><?php echo esc_html( get_the_title( $previous ) ); ?></a><?php else : ?><span></span><?php endif; ?>
                    <?php if ( $next ) : ?><a class="r" href="<?php echo esc_url( get_permalink( $next ) ); ?>"><small>下一篇</small><?php echo esc_html( get_the_title( $next ) ); ?></a><?php endif; ?>
                </nav>
            <?php endif; ?>
            <?php if ( comments_open() || get_comments_number() ) { comments_template(); } ?>
        <?php endwhile; ?>
    </div>
</section>
<?php get_footer(); ?>
