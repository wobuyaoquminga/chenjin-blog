<?php
/** Shared Muse-style presentation for a real WordPress loop item. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function chenjin_muse_post_card() {
    $post_type = get_post_type();
    $category  = 'post' === $post_type ? get_the_category() : array();
    $type_obj  = get_post_type_object( $post_type );
    $label     = $category ? $category[0]->name : ( 'page' === $post_type ? '页面' : ( $type_obj ? $type_obj->labels->singular_name : '内容' ) );
    $excerpt   = get_the_excerpt();
    $url       = get_permalink();
    ?>
    <article <?php post_class( 'card' ); ?>>
        <?php if ( has_post_thumbnail() ) : ?><a class="muse-card-cover" href="<?php echo esc_url( $url ); ?>"><?php the_post_thumbnail( 'medium_large' ); ?></a><?php endif; ?>
        <div class="card-kicker">
            <span class="tag"><?php echo esc_html( $label ); ?></span>
            <time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
        </div>
        <h3><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( get_the_title() ); ?></a></h3>
        <?php if ( $excerpt ) : ?><p class="desc"><?php echo esc_html( wp_trim_words( $excerpt, 42 ) ); ?></p><?php endif; ?>
        <div class="links"><a class="btn small" href="<?php echo esc_url( $url ); ?>"><?php echo 'post' === $post_type ? '阅读全文' : '查看页面'; ?></a></div>
    </article>
    <?php
}

function chenjin_muse_pagination() {
    $links = paginate_links( array(
        'type'      => 'list',
        'prev_text' => '← 上一页',
        'next_text' => '下一页 →',
    ) );
    if ( $links ) {
        echo '<nav class="muse-pagination" aria-label="分页">' . wp_kses_post( $links ) . '</nav>';
    }
}
