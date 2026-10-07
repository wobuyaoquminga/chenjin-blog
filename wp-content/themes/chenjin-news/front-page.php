<?php
/** The existing homepage URL shows the parent's real article cards, not imported demo content. */
get_header();
$GLOBALS['chenjin_news_front'] = true;
$articles = new WP_Query( array(
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => get_option( 'posts_per_page' ),
) );
?>
<div class="ct-container" data-vertical-spacing="top:bottom"><section>
    <?php chenjin_news_intro(); ?>
    <?php echo blocksy_render_archive_cards( array( 'query' => $articles, 'prefix' => 'blog', 'has_pagination' => false ) ); ?>
    <p class="chenjin-news-all"><a href="<?php echo esc_url( get_permalink( (int) get_option( 'page_for_posts' ) ) ); ?>">查看全部文章 <span aria-hidden="true">→</span></a></p>
</section></div>
<?php
wp_reset_postdata();
unset( $GLOBALS['chenjin_news_front'] );
get_footer();
