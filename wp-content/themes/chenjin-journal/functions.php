<?php
/** Theme setup and small presentation helpers. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ws_journal_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'style.css' );
	add_theme_support( 'custom-logo', array( 'height' => 96, 'width' => 320, 'flex-height' => true, 'flex-width' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style' ) );
	register_nav_menus( array( 'primary' => '主导航', 'footer' => '页脚导航' ) );
}
add_action( 'after_setup_theme', 'ws_journal_setup' );

function ws_journal_assets() {
	wp_enqueue_style( 'ws-journal', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_script( 'ws-journal', get_template_directory_uri() . '/theme.js', array(), wp_get_theme()->get( 'Version' ), true );
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'ws_journal_assets' );

function ws_journal_favicon() {
	if ( ! has_site_icon() ) {
		echo '<link rel="icon" type="image/svg+xml" href="' . esc_url( get_template_directory_uri() . '/icon.svg' ) . '">';
	}
}
add_action( 'wp_head', 'ws_journal_favicon' );

function ws_journal_fallback_menu() {
	$items = array(
		array( '首页', home_url( '/' ) ),
		array( '文章', get_option( 'page_for_posts' ) ? get_permalink( (int) get_option( 'page_for_posts' ) ) : home_url( '/articles/' ) ),
		array( '项目', home_url( '/projects/' ) ),
		array( '关于', home_url( '/about/' ) ),
		array( '联系', home_url( '/contact/' ) ),
	);
	echo '<ul class="menu">';
	foreach ( $items as $item ) {
		echo '<li><a href="' . esc_url( $item[1] ) . '">' . esc_html( $item[0] ) . '</a></li>';
	}
	echo '</ul>';
}

function ws_journal_posts_url() {
	$page_id = (int) get_option( 'page_for_posts' );
	return $page_id ? get_permalink( $page_id ) : home_url( '/articles/' );
}

function ws_journal_post_card() {
	?>
	<article <?php post_class( 'post-card' ); ?>>
		<a class="post-card__image" href="<?php the_permalink(); ?>" aria-label="<?php echo esc_attr( get_the_title() ); ?>">
			<?php if ( has_post_thumbnail() ) : ?>
				<?php the_post_thumbnail( 'large', array( 'loading' => 'lazy' ) ); ?>
			<?php else : ?>
				<span class="post-card__placeholder" aria-hidden="true">✳</span>
			<?php endif; ?>
		</a>
		<div class="post-card__body">
			<div class="eyebrow"><?php echo esc_html( get_the_date( 'Y.m.d' ) ); ?><?php $categories = get_the_category(); if ( $categories ) : ?><span aria-hidden="true"> · </span><?php echo esc_html( $categories[0]->name ); ?><?php endif; ?></div>
			<h2 class="post-card__title"><a href="<?php the_permalink(); ?>"><?php echo esc_html( get_the_title() ); ?></a></h2>
			<p class="post-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32, '…' ) ); ?></p>
			<a class="text-link" href="<?php the_permalink(); ?>">阅读全文 <span aria-hidden="true">↗</span></a>
		</div>
	</article>
	<?php
}

function ws_journal_comment_fields( $fields ) {
	foreach ( $fields as $key => $field ) {
		$fields[ $key ] = str_replace( '<input ', '<input class="comment-input" ', $field );
	}
	return $fields;
}
add_filter( 'comment_form_default_fields', 'ws_journal_comment_fields' );
