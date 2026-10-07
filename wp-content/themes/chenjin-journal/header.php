<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<script>try{var t=localStorage.getItem('ws-journal-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.theme='dark'}catch(e){}</script>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#content">跳转到正文</a>
<div class="site-shell">
	<header class="site-header">
		<div class="container header-inner">
			<div class="brand">
				<?php if ( has_custom_logo() ) { the_custom_logo(); } ?>
				<a class="brand-name" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( get_bloginfo( 'name' ) ); ?><span aria-hidden="true">.</span></a>
			</div>
			<nav class="main-nav" aria-label="主导航">
				<?php wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'fallback_cb' => 'ws_journal_fallback_menu', 'depth' => 2 ) ); ?>
			</nav>
			<div class="header-actions">
				<a class="icon-button" href="<?php echo esc_url( home_url( '/?s=' ) ); ?>" aria-label="搜索文章" title="搜索文章"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></a>
				<a class="icon-button" href="<?php echo esc_url( get_bloginfo( 'rss2_url' ) ); ?>" aria-label="订阅 RSS" title="订阅 RSS"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="19" r="1"/><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/></svg></a>
				<button class="icon-button theme-toggle" type="button" aria-label="切换深色模式" aria-pressed="false" title="切换深色模式"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z"/></svg></button>
			</div>
		</div>
	</header>
	<main id="content" class="site-main">
