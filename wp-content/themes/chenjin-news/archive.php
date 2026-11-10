<?php
/** Native category, tag, author and date archives. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$posts_page = (int) get_option( 'page_for_posts' );
?>
<section class="view active" data-view="articles">
    <div class="wrap">
        <div class="page-head">
            <p><a href="<?php echo esc_url( $posts_page ? get_permalink( $posts_page ) : home_url( '/articles/' ) ); ?>">← 全部文章</a></p>
            <h1 class="sec-title shine"><?php echo esc_html( wp_strip_all_tags( get_the_archive_title() ) ); ?></h1>
            <?php if ( get_the_archive_description() ) : ?><div class="sec-sub"><?php echo wp_kses_post( get_the_archive_description() ); ?></div><?php endif; ?>
        </div>
        <?php if ( is_category() ) : ?>
            <nav class="toolbar muse-category-chips" aria-label="文章分类">
                <a class="chip" href="<?php echo esc_url( $posts_page ? get_permalink( $posts_page ) : home_url( '/articles/' ) ); ?>">全部</a>
                <?php foreach ( get_categories( array( 'hide_empty' => true ) ) as $category ) : ?>
                    <a class="chip<?php echo is_category( $category->term_id ) ? ' on' : ''; ?>" href="<?php echo esc_url( get_category_link( $category->term_id ) ); ?>"<?php echo is_category( $category->term_id ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $category->name ); ?></a>
                <?php endforeach; ?>
            </nav>
        <?php endif; ?>
        <?php if ( have_posts() ) : ?>
            <div class="grid p1 muse-article-list">
                <?php while ( have_posts() ) : the_post(); chenjin_muse_post_card(); endwhile; ?>
            </div>
            <?php chenjin_muse_pagination(); ?>
        <?php else : ?>
            <div class="empty">此处还没有内容。</div>
        <?php endif; ?>
    </div>
</section>
<?php get_footer(); ?>
