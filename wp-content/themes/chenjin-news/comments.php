<?php
/** Native comments query is populated by comments_template(). */
if ( ! defined( 'ABSPATH' ) || post_password_required() ) { return; }
?>
            <?php if ( comments_open() || get_comments_number() ) : ?>
                <section id="comments" class="muse-comments" aria-labelledby="muse-comments-title">
                    <h2 class="sec-title" id="muse-comments-title">评论<?php if ( get_comments_number() ) : ?> <small><?php echo esc_html( number_format_i18n( get_comments_number() ) ); ?></small><?php endif; ?></h2>
                    <?php if ( get_comments_number() ) : ?>
                        <ol class="comment-list"><?php wp_list_comments( array( 'style' => 'ol', 'short_ping' => true, 'avatar_size' => 0 ) ); ?></ol>
                        <?php the_comments_pagination( array( 'prev_text' => '← 较早评论', 'next_text' => '较新评论 →' ) ); ?>
                    <?php endif; ?>
                    <?php if ( comments_open() ) : ?>
                        <?php comment_form( array(
                            'title_reply'          => '发表评论',
                            'class_submit'         => 'btn gold',
                            'comment_notes_after'  => '<p class="form-note">评论按站点设置审核后公开。</p>',
                        ) ); ?>
                    <?php else : ?><p class="form-note">评论已关闭。</p><?php endif; ?>
                </section>
            <?php endif; ?>
