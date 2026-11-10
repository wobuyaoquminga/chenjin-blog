<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
blocksy_after_current_template(); do_action( 'blocksy:content:bottom' );
?>
</main>
<?php do_action( 'blocksy:content:after' ); do_action( 'blocksy:footer:before' ); ?>
<footer class="cjn-footer"><div class="wrap"><div class="cjn-footer-bottom"><?php echo str_replace( '{current_year}', esc_html( wp_date( 'Y' ) ), apply_filters( 'blocksy:footer:copyright:value', '' ) ); ?></div></div></footer>
<?php do_action( 'blocksy:footer:after' ); ?>
</div>
<?php wp_footer(); ?>
</body></html>
