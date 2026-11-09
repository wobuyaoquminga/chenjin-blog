<?php
/** Homepage: a visual introduction to the site's real posts and public projects. */
get_header();

$GLOBALS['chenjin_news_front'] = true;
$articles = new WP_Query( array(
    'post_type'           => 'post',
    'post_status'         => 'publish',
    'posts_per_page'      => 4,
    'ignore_sticky_posts' => true,
) );
$articles_page = (int) get_option( 'page_for_posts' );
$articles_url = $articles_page ? get_permalink( $articles_page ) : home_url( '/articles/' );
$projects_url = home_url( '/projects/' );
?>
<div class="cjn-home">
    <section class="cjn-hero cjn-shell" aria-labelledby="cjn-hero-title">
        <div class="cjn-hero-content">
        <h1 id="cjn-hero-title" data-reveal><?php echo esc_html( get_bloginfo( 'name' ) ); ?></h1>
        </div>
        <section id="solar-system" class="cjn-solar" data-solar-system aria-label="三维太阳系运行模型" aria-description="行星贴图：Solar System Scope，CC BY 4.0；各天体以不同的固定速度自转和公转，尺寸、距离与速度用于演示。">
            <div class="cjn-solar-viewport" tabindex="0" aria-label="拖动旋转三维太阳系，滚轮或双指缩放"></div>
            <div class="cjn-solar-fallback">
                <img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/saturn-cassini.jpg' ); ?>" width="1536" height="785" alt="土星 — NASA/JPL/Space Science Institute">
            </div>
        </section>
    </section>

    <section id="featured-projects" class="cjn-section cjn-project-section cjn-shell" aria-labelledby="cjn-project-title">
        <div class="cjn-section-heading" data-reveal>
            <h2 id="cjn-project-title">项目</h2>
            <a class="cjn-section-link" href="<?php echo esc_url( $projects_url ); ?>">全部项目 <span aria-hidden="true">↗</span></a>
        </div>
        <div class="cjn-project-stage" data-reveal>
            <?php if ( shortcode_exists( 'ws_projects' ) ) : ?>
                <?php echo do_shortcode( '[ws_projects limit="4"]' ); // The shortcode escapes repository data. ?>
            <?php else : ?>
                <p class="cjn-empty">项目列表暂时不可用。<a href="<?php echo esc_url( $projects_url ); ?>">前往项目页</a></p>
            <?php endif; ?>
        </div>
    </section>

    <section id="latest-articles" class="cjn-section cjn-article-section cjn-shell" aria-labelledby="cjn-article-title">
        <div class="cjn-section-heading" data-reveal>
            <h2 id="cjn-article-title">文章</h2>
            <a class="cjn-section-link" href="<?php echo esc_url( $articles_url ); ?>">全部文章 <span aria-hidden="true">↗</span></a>
        </div>
        <div class="cjn-article-stage">
            <?php if ( $articles->have_posts() ) : ?>
                <?php echo blocksy_render_archive_cards( array( 'query' => $articles, 'prefix' => 'blog', 'has_pagination' => false ) ); ?>
            <?php else : ?>
                <p class="cjn-empty">暂无文章。查看<a href="<?php echo esc_url( $projects_url ); ?>">公开项目</a>。</p>
            <?php endif; ?>
        </div>
    </section>

</div>
<?php
wp_reset_postdata();
unset( $GLOBALS['chenjin_news_front'] );
get_footer();
