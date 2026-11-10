<?php
/** Muse's galaxy design with live WordPress content and public repositories. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$articles = new WP_Query( array( 'post_type'=>'post', 'post_status'=>'publish', 'posts_per_page'=>4, 'ignore_sticky_posts'=>true ) );
$posts_page=(int)get_option('page_for_posts');
$articles_url=$posts_page?get_permalink($posts_page):home_url('/articles/');
?>
<section class="view active cjn-home" data-view="home">
 <div class="hero">
  <div class="hero-stage">
   <div class="hero-copy">
    <h1 id="heroTitle" aria-label="<?php echo esc_attr(get_bloginfo('name')); ?>"><?php echo esc_html(get_bloginfo('name')); ?></h1>
    <div class="hero-cta"><a class="btn gold" href="<?php echo esc_url(home_url('/projects/')); ?>">看项目</a><a class="btn" href="<?php echo esc_url($articles_url); ?>">读文章</a></div>
   </div>
   <div class="hero-canvas-wrap cjn-solar" id="glWrap" data-solar-system>
    <canvas id="gl" aria-label="三维星系中的太阳系，可拖动旋转、缩放和点击星体聚焦"></canvas>
    <div id="glError" role="status"></div><noscript><div class="muse-static-sky"><img src="<?php echo esc_url(get_stylesheet_directory_uri().'/assets/saturn-cassini.jpg'); ?>" alt="土星 — NASA/JPL/Space Science Institute"></div></noscript>
   </div>
  </div><div class="hero-fade" aria-hidden="true"></div>
 </div>
 <div class="wrap">
  <section class="block" id="featured-projects"><div class="sec-head" data-reveal><h2 class="sec-title">开源项目</h2><a class="more" href="<?php echo esc_url(home_url('/projects/')); ?>">全部项目 →</a></div>
   <?php if(shortcode_exists('ws_projects')){echo do_shortcode('[ws_projects limit="4"]');} ?>
  </section>
  <section class="block" id="latest-articles"><div class="sec-head" data-reveal><h2 class="sec-title">最新文章</h2><a class="more" href="<?php echo esc_url($articles_url); ?>">全部文章 →</a></div>
   <div class="grid p2"><?php while($articles->have_posts()):$articles->the_post(); chenjin_muse_post_card(); endwhile; ?></div>
  </section>
 </div>
</section>
<?php wp_reset_postdata(); get_footer(); ?>
