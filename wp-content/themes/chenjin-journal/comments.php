<?php
if ( post_password_required() ) {
	return;
}
?>
<section id="comments" class="comments-area" aria-labelledby="comments-heading">
	<h2 id="comments-heading">评论 <span class="accent"><?php echo esc_html( get_comments_number() ); ?></span></h2>
	<?php if ( have_comments() ) : ?>
		<ol class="comment-list"><?php wp_list_comments( array( 'style' => 'ol', 'short_ping' => true, 'avatar_size' => 48 ) ); ?></ol>
		<?php the_comments_pagination( array( 'prev_text' => '← 较早评论', 'next_text' => '较新评论 →' ) ); ?>
	<?php endif; ?>
	<?php if ( ! comments_open() && get_comments_number() ) : ?><p class="comments-closed">评论已关闭。</p><?php endif; ?>
	<?php if ( comments_open() ) :
		comment_form( array(
			'title_reply' => '留下评论',
			'title_reply_to' => '回复 %s',
			'cancel_reply_link' => '取消回复',
			'label_submit' => '提交评论',
			'comment_field' => '<p class="comment-form-comment"><label for="comment">评论内容 <span class="required">*</span></label><textarea id="comment" name="comment" cols="45" rows="6" maxlength="65525" required></textarea></p>',
			'comment_notes_before' => '<p class="comment-notes">评论可能需要审核后才会显示。</p>',
		) );
	endif; ?>
</section>
