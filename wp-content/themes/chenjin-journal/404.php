<?php get_header(); ?>
<div class="container error-page"><p class="eyebrow">PAGE NOT FOUND</p><div class="error-code">404<span class="accent">.</span></div><h1>这一页不在这里。</h1><p>链接可能已更改，试试搜索，或回到首页继续浏览。</p><div class="error-actions"><a class="button button--solid" href="<?php echo esc_url( home_url( '/' ) ); ?>">返回首页 <span aria-hidden="true">↗</span></a></div><?php get_search_form(); ?></div>
<?php get_footer(); ?>
