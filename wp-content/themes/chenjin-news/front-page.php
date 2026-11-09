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
$post_counts = wp_count_posts( 'post' );
$post_count = isset( $post_counts->publish ) ? (int) $post_counts->publish : 0;
$github_data = get_option( 'ws_github_data', array() );
$github_repos = isset( $github_data['repos'] ) && is_array( $github_data['repos'] ) ? $github_data['repos'] : array();
$project_count = count( array_filter( $github_repos, static function ( $repo ) {
    return is_array( $repo ) && ! empty( $repo['name'] ) && empty( $repo['private'] );
} ) );
$articles_page = (int) get_option( 'page_for_posts' );
$articles_url = $articles_page ? get_permalink( $articles_page ) : home_url( '/articles/' );
$projects_url = home_url( '/projects/' );
?>
<div class="cjn-home">
    <section class="cjn-hero cjn-shell" aria-labelledby="cjn-hero-title">
        <div class="cjn-hero-copy">
            <p class="cjn-kicker" data-reveal><span class="cjn-kicker-dot" aria-hidden="true"></span> 陈今的个人空间 <span class="cjn-kicker-rule" aria-hidden="true"></span> 开发 · 创作 · 记录</p>
            <h1 id="cjn-hero-title" data-reveal>把想法，<br><span>写成现实。</span></h1>
            <p class="cjn-hero-description" data-reveal>写代码，也写思考。这里收集技术笔记、公开项目，以及从构想到落地的过程。</p>
            <div class="cjn-hero-actions" data-reveal>
                <a class="cjn-cta" data-magnetic href="<?php echo esc_url( $projects_url ); ?>">探索项目 <span aria-hidden="true">↗</span></a>
                <a class="cjn-cta-secondary" data-magnetic href="<?php echo esc_url( $articles_url ); ?>">阅读文章 <span aria-hidden="true">→</span></a>
            </div>
            <div class="cjn-hero-facts" data-reveal aria-label="站点内容数量">
                <div><strong><?php echo esc_html( number_format_i18n( $post_count ) ); ?></strong><span>已发布文章</span></div>
                <span class="cjn-fact-divider" aria-hidden="true"></span>
                <div><strong><?php echo esc_html( number_format_i18n( $project_count ) ); ?></strong><span>公开项目</span></div>
            </div>
        </div>
        <div class="cjn-hero-art" aria-hidden="true">
            <div class="cjn-scene">
                <div class="cjn-scene-grid"></div>
                <div class="cjn-orbit">
                    <span class="cjn-orbit-ring cjn-orbit-ring-a"></span>
                    <span class="cjn-orbit-ring cjn-orbit-ring-b"></span>
                    <span class="cjn-orbit-ring cjn-orbit-ring-c"></span>
                    <span class="cjn-orbit-satellite cjn-orbit-satellite-a"></span>
                    <span class="cjn-orbit-satellite cjn-orbit-satellite-b"></span>
                    <span class="cjn-orbit-core"><span class="cjn-core-lines"></span><span class="cjn-core-glow"></span></span>
                </div>
                <span class="cjn-scene-coordinate cjn-scene-coordinate-top">01 / IMAGINE</span>
                <span class="cjn-scene-coordinate cjn-scene-coordinate-bottom">02 / BUILD</span>
                <span class="cjn-scene-cross cjn-scene-cross-a">+</span>
                <span class="cjn-scene-cross cjn-scene-cross-b">+</span>
            </div>
            <p class="cjn-scene-caption">从好奇出发，在实践中成形。<span aria-hidden="true">↗</span></p>
        </div>
        <a class="cjn-scroll-cue" href="#featured-projects"><span class="cjn-scroll-cue-line" aria-hidden="true"></span> 向下探索</a>
    </section>

    <div class="cjn-marquee" aria-hidden="true"><div class="cjn-marquee-inner"><span>IDEAS INTO REALITY</span><i>✳</i><span>CODE / CREATE / SHARE</span><i>✳</i><span>IDEAS INTO REALITY</span><i>✳</i><span>CODE / CREATE / SHARE</span><i>✳</i></div></div>

    <section id="featured-projects" class="cjn-section cjn-project-section cjn-shell" aria-labelledby="cjn-project-title">
        <div class="cjn-section-heading" data-reveal>
            <div><p class="cjn-section-index">01 / SELECTED WORK</p><h2 id="cjn-project-title">让作品<span>开口说话。</span></h2><p>公开项目、源码与资源，都可以继续往里看。</p></div>
            <a class="cjn-section-link" href="<?php echo esc_url( $projects_url ); ?>">全部项目 <span aria-hidden="true">↗</span></a>
        </div>
        <div class="cjn-project-stage" data-reveal>
            <?php if ( shortcode_exists( 'ws_projects' ) ) : ?>
                <?php echo do_shortcode( '[ws_projects limit="3"]' ); // The shortcode escapes repository data. ?>
            <?php else : ?>
                <p class="cjn-empty">项目列表暂时不可用。<a href="<?php echo esc_url( $projects_url ); ?>">前往项目页</a></p>
            <?php endif; ?>
        </div>
    </section>

    <section id="latest-articles" class="cjn-section cjn-article-section cjn-shell" aria-labelledby="cjn-article-title">
        <div class="cjn-section-heading" data-reveal>
            <div><p class="cjn-section-index">02 / FROM THE JOURNAL</p><h2 id="cjn-article-title">文字，也是一种<span>构建。</span></h2><p>写下踩过的坑、发现的解法和途中值得记住的事。</p></div>
            <a class="cjn-section-link" href="<?php echo esc_url( $articles_url ); ?>">全部文章 <span aria-hidden="true">↗</span></a>
        </div>
        <div class="cjn-article-stage">
            <?php if ( $articles->have_posts() ) : ?>
                <?php echo blocksy_render_archive_cards( array( 'query' => $articles, 'prefix' => 'blog', 'has_pagination' => false ) ); ?>
            <?php else : ?>
                <p class="cjn-empty">文章还在路上。欢迎先看看<a href="<?php echo esc_url( $projects_url ); ?>">公开项目</a>。</p>
            <?php endif; ?>
        </div>
    </section>

    <section class="cjn-outro cjn-shell" aria-labelledby="cjn-outro-title" data-reveal>
        <div class="cjn-outro-orbit" aria-hidden="true"></div>
        <p class="cjn-section-index">03 / KEEP EXPLORING</p>
        <h2 id="cjn-outro-title">下一次灵感，<br><em>也许就在这里。</em></h2>
        <p>想聊一个想法，或只是留下几句话，都欢迎。</p>
        <a class="cjn-cta" data-magnetic href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">给我留言 <span aria-hidden="true">↗</span></a>
    </section>
</div>
<?php
wp_reset_postdata();
unset( $GLOBALS['chenjin_news_front'] );
get_footer();
