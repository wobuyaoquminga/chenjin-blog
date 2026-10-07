<?php get_header(); ?>
<section class="hero container">
	<div class="hero__copy">
		<p class="eyebrow"><span class="eyebrow-line"></span> CHENJIN / JOURNAL</p>
		<h1>你好，我是陈今<span class="accent">.</span><br><span class="hero__subline">欢迎来到我的数字角落。</span></h1>
		<p class="hero__description"><?php $description = get_bloginfo( 'description' ); echo esc_html( $description ? $description : '在这里记录文章、项目与持续更新的想法。' ); ?></p>
		<div class="hero__actions"><a class="button button--solid" href="<?php echo esc_url( ws_journal_posts_url() ); ?>">阅读文章 <span aria-hidden="true">↗</span></a><a class="button button--outline" href="<?php echo esc_url( home_url( '/about/' ) ); ?>">了解更多</a></div>
	</div>
	<div class="hero__visual" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><span class="hero__glyph">今</span><span class="visual-note">思考 · 创作 · 记录</span></div>
</section>
<section class="section container" aria-labelledby="latest-heading">
	<div class="section-heading"><div><p class="eyebrow">01 / WRITING</p><h2 id="latest-heading">最新文章<span class="accent">.</span></h2><p>一些正在形成的想法，和值得留下的文字。</p></div><a class="text-link" href="<?php echo esc_url( ws_journal_posts_url() ); ?>">浏览全部文章 <span aria-hidden="true">↗</span></a></div>
	<?php $latest = new WP_Query( array( 'post_type' => 'post', 'posts_per_page' => 3, 'ignore_sticky_posts' => true ) ); ?>
	<?php if ( $latest->have_posts() ) : ?><div class="post-grid"><?php while ( $latest->have_posts() ) : $latest->the_post(); ws_journal_post_card(); endwhile; ?></div><?php else : ?><div class="empty-state"><span aria-hidden="true">✳</span><p>文章正在路上，稍后再来看看。</p></div><?php endif; wp_reset_postdata(); ?>
</section>
<section class="section section--tint" aria-labelledby="projects-heading"><div class="container"><div class="section-heading"><div><p class="eyebrow">02 / SELECTED WORK</p><h2 id="projects-heading">精选项目<span class="accent">.</span></h2><p>持续构建中的作品与实践。</p></div><a class="text-link" href="<?php echo esc_url( home_url( '/projects/' ) ); ?>">查看全部项目 <span aria-hidden="true">↗</span></a></div><?php echo do_shortcode( '[ws_projects limit="3"]' ); ?></div></section>
<section class="closing-note container"><span class="closing-note__mark" aria-hidden="true">“</span><div><p>保持好奇，持续创造。</p><a class="text-link" href="<?php echo esc_url( home_url( '/about/' ) ); ?>">更多关于我 <span aria-hidden="true">↗</span></a></div></section>
<?php get_footer(); ?>
