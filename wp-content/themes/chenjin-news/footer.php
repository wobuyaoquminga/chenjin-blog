<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
blocksy_after_current_template();
do_action( 'blocksy:content:bottom' );
?>
    </main>
    <?php do_action( 'blocksy:content:after' ); do_action( 'blocksy:footer:before' ); ?>
    <footer class="cjn-footer">
        <div class="cjn-shell">
            <div class="cjn-footer-top">
                <div class="cjn-footer-brand"><span class="cjn-brand-mark" aria-hidden="true">今</span><p>把想法留下，<br>让作品发生。</p></div>
                <div class="cjn-footer-links" aria-label="页脚导航">
                    <a href="<?php echo esc_url( home_url( '/projects/' ) ); ?>">探索项目 <span aria-hidden="true">↗</span></a>
                    <a href="<?php echo esc_url( home_url( '/articles/' ) ); ?>">阅读文章 <span aria-hidden="true">↗</span></a>
                    <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">站内联系 <span aria-hidden="true">↗</span></a>
                </div>
            </div>
            <div class="cjn-footer-bottom"><?php echo str_replace( '{current_year}', esc_html( wp_date( 'Y' ) ), apply_filters( 'blocksy:footer:copyright:value', '' ) ); ?></div>
        </div>
    </footer>
    <?php do_action( 'blocksy:footer:after' ); ?>
</div>
<?php wp_footer(); ?>
</body>
</html>
