	</main>
	<footer class="site-footer">
		<div class="container footer-inner">
			<div><a class="footer-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( get_bloginfo( 'name' ) ); ?><span>.</span></a><p>记录思考，分享作品。</p></div>
			<div class="footer-links">
				<?php if ( has_nav_menu( 'footer' ) ) { wp_nav_menu( array( 'theme_location' => 'footer', 'container' => false, 'depth' => 1 ) ); } ?>
				<a href="<?php echo esc_url( get_bloginfo( 'rss2_url' ) ); ?>">RSS</a>
				<a href="<?php echo esc_url( home_url( '/about/' ) ); ?>">关于</a>
				<a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">联系</a>
				<a href="<?php echo esc_url( get_privacy_policy_url() ); ?>">隐私</a>
			</div>
		</div>
		<div class="container footer-bottom"><span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></span><span>由 WordPress 驱动</span></div>
	</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
