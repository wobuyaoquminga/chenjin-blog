<?php
/** Real page content; project and contact forms remain plugin-backed. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( is_page( 'projects' ) && isset( $_GET['project'] ) ) {
    $name = is_string( $_GET['project'] ) ? wp_unslash( $_GET['project'] ) : '';
    $detail = function_exists( 'ws_github_render_project_page' ) ? ws_github_render_project_page( $name ) : false;
    if ( false === $detail ) { status_header( 404 ); nocache_headers(); }
    get_header();
    echo '<section class="view active" data-view="project"><div class="wrap">';
    if ( false === $detail ) {
        echo '<div class="page-head"><h1 class="sec-title">未找到这个公开项目</h1><p><a href="' . esc_url( home_url( '/projects/' ) ) . '">返回项目资源</a></p></div>';
    } else { echo $detail; } // The plugin escapes every public repository field.
    echo '</div></section>';
    get_footer();
    return;
}
get_header();
?>
<?php while ( have_posts() ) : the_post();
    $is_projects = is_page( 'projects' );
    $is_contact  = is_page( 'contact' );
    $content     = get_post_field( 'post_content', get_the_ID() );
    $view        = $is_projects ? 'projects' : ( $is_contact ? 'contact' : ( is_page( 'about' ) ? 'about' : 'page' ) );
    ?>
    <section class="view active" data-view="<?php echo esc_attr( $view ); ?>">
        <div class="wrap">
            <header class="page-head"><h1 class="sec-title shine"><?php echo esc_html( get_the_title() ); ?></h1></header>
            <article id="post-<?php the_ID(); ?>" <?php post_class( 'muse-page-content post-body' ); ?>>
                <?php the_content(); ?>
                <?php if ( $is_projects && shortcode_exists( 'ws_projects' ) && ! has_shortcode( $content, 'ws_projects' ) ) : ?>
                    <?php echo do_shortcode( '[ws_projects]' ); // Plugin escapes public repository data. ?>
                <?php endif; ?>
                <?php if ( $is_contact && shortcode_exists( 'chenjin_contact' ) && ! has_shortcode( $content, 'chenjin_contact' ) ) : ?>
                    <?php echo do_shortcode( '[chenjin_contact]' ); // Plugin handles nonce, validation and private storage. ?>
                <?php endif; ?>
                <?php wp_link_pages( array( 'before' => '<nav class="muse-pagination" aria-label="页面分页">', 'after' => '</nav>' ) ); ?>
            </article>
        </div>
    </section>
<?php endwhile; ?>
<?php get_footer(); ?>
