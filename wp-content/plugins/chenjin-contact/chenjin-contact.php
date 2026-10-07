<?php
/**
 * Plugin Name: 陈今的站内联系
 * Description: 私密站内来信表单，不收集邮箱或发送邮件。
 * Version: 1.0.0
 * License: GPL-2.0-or-later
 * Text Domain: chenjin-contact
 */

if (!defined('ABSPATH')) {
    exit;
}

function chenjin_contact_register_type() {
    register_post_type('chenjin_message', array(
        'labels' => array(
            'name' => '站内来信',
            'singular_name' => '来信',
            'edit_item' => '查看来信',
            'all_items' => '所有来信',
            'menu_name' => '站内来信',
        ),
        'public' => false,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => false,
        'exclude_from_search' => true,
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
        'menu_icon' => 'dashicons-email-alt',
        'supports' => array('title', 'editor'),
        'map_meta_cap' => true,
        'capabilities' => array(
            'edit_post' => 'edit_chenjin_message',
            'read_post' => 'read_chenjin_message',
            'delete_post' => 'delete_chenjin_message',
            'edit_posts' => 'manage_options',
            'edit_others_posts' => 'manage_options',
            'edit_private_posts' => 'manage_options',
            'edit_published_posts' => 'manage_options',
            'publish_posts' => 'manage_options',
            'read_private_posts' => 'manage_options',
            'delete_posts' => 'manage_options',
            'delete_private_posts' => 'manage_options',
            'delete_published_posts' => 'manage_options',
            'delete_others_posts' => 'manage_options',
            'create_posts' => 'do_not_allow',
        ),
    ));
}
add_action('init', 'chenjin_contact_register_type');

function chenjin_contact_form() {
    wp_enqueue_style('chenjin-contact', plugin_dir_url(__FILE__) . 'contact.css', array(), '1.0.0');
    $sent = isset($_GET['sent']) && $_GET['sent'] === '1';
    $errors = array(
        'invalid' => '请填写主题和正文，并检查字数限制。',
        'expired' => '页面已过期，请刷新后重试。',
        'limit' => '提交次数较多，请稍后再试。',
        'save' => '暂时无法保存来信，请稍后重试。',
    );
    $error = isset($_GET['contact_error']) && is_string($_GET['contact_error'])
        ? $errors[sanitize_key(wp_unslash($_GET['contact_error']))] ?? '' : '';
    ob_start();
    ?>
    <section class="chenjin-contact" aria-labelledby="chenjin-contact-title">
        <h2 id="chenjin-contact-title">给我留言</h2>
        <p class="chenjin-contact-intro">写下想说的话，来信只供站长在后台查看。无需留下姓名或邮箱。</p>
        <?php if ($sent) : ?><p class="chenjin-contact-notice" role="status">来信已保存，谢谢你的留言。</p><?php endif; ?>
        <?php if ($error) : ?><p class="chenjin-contact-notice chenjin-contact-error" role="alert"><?php echo esc_html($error); ?></p><?php endif; ?>
        <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
            <input type="hidden" name="action" value="chenjin_contact_submit">
            <?php wp_nonce_field('chenjin_contact_submit', 'chenjin_contact_nonce'); ?>
            <div class="chenjin-contact-trap" aria-hidden="true"><label for="chenjin-contact-website">网站地址</label><input id="chenjin-contact-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
            <label for="chenjin-contact-nickname">昵称 <span>选填，最多 40 字</span></label>
            <input id="chenjin-contact-nickname" name="nickname" type="text" maxlength="40" autocomplete="nickname">
            <label for="chenjin-contact-subject">主题 <span>必填，最多 120 字</span></label>
            <input id="chenjin-contact-subject" name="subject" type="text" maxlength="120" required>
            <label for="chenjin-contact-message">正文 <span>必填，最多 5000 字</span></label>
            <textarea id="chenjin-contact-message" name="message" rows="8" maxlength="5000" required></textarea>
            <button type="submit">发送留言</button>
        </form>
    </section>
    <?php
    return ob_get_clean();
}
add_shortcode('chenjin_contact', 'chenjin_contact_form');

function chenjin_contact_length($text) {
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
}

function chenjin_contact_validate($nickname, $subject, $message) {
    if (!is_string($nickname) || !is_string($subject) || !is_string($message)) {
        return false;
    }
    if (!preg_match('/[^\s\x{3000}]/u', $subject) || !preg_match('/[^\s\x{3000}]/u', $message)) {
        return false;
    }
    return chenjin_contact_length($nickname) <= 40
        && chenjin_contact_length($subject) <= 120
        && chenjin_contact_length($message) <= 5000;
}

function chenjin_contact_redirect($code = '') {
    $url = home_url('/contact/');
    $url = add_query_arg($code === 'sent' ? 'sent' : 'contact_error', $code === 'sent' ? '1' : $code, $url);
    wp_safe_redirect($url, 303);
    exit;
}

function chenjin_contact_submit() {
    $nonce = isset($_POST['chenjin_contact_nonce']) && is_string($_POST['chenjin_contact_nonce'])
        ? sanitize_text_field(wp_unslash($_POST['chenjin_contact_nonce'])) : '';
    if (!wp_verify_nonce($nonce, 'chenjin_contact_submit')) {
        chenjin_contact_redirect('expired');
    }
    if (!empty($_POST['website'])) {
        chenjin_contact_redirect('invalid');
    }
    $nickname = isset($_POST['nickname']) && is_string($_POST['nickname']) ? sanitize_text_field(wp_unslash($_POST['nickname'])) : '';
    $subject = isset($_POST['subject']) && is_string($_POST['subject']) ? sanitize_text_field(wp_unslash($_POST['subject'])) : '';
    $message = isset($_POST['message']) && is_string($_POST['message']) ? sanitize_textarea_field(wp_unslash($_POST['message'])) : '';
    if (!chenjin_contact_validate($nickname, $subject, $message)) {
        chenjin_contact_redirect('invalid');
    }

    $ip = isset($_SERVER['REMOTE_ADDR']) && is_string($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    $key = 'chenjin_contact_' . substr(hash_hmac('sha256', $ip, wp_salt('auth')), 0, 32);
    $limit = get_transient($key);
    $count = is_array($limit) ? (int) ($limit['count'] ?? 0) : 0;
    $started = is_array($limit) ? (int) ($limit['started'] ?? time()) : time();
    if ($count >= 3) {
        chenjin_contact_redirect('limit');
    }

    $post_id = wp_insert_post(array(
        'post_type' => 'chenjin_message',
        'post_status' => 'private',
        'post_title' => wp_slash($subject),
        'post_content' => wp_slash($message),
        'post_author' => 0,
        'meta_input' => array('_chenjin_contact_nickname' => wp_slash($nickname)),
    ), true);
    if (is_wp_error($post_id) || !$post_id) {
        chenjin_contact_redirect('save');
    }
    set_transient($key, array('count' => $count + 1, 'started' => $started), max(1, 3600 - (time() - $started)));
    chenjin_contact_redirect('sent');
}
add_action('admin_post_nopriv_chenjin_contact_submit', 'chenjin_contact_submit');
add_action('admin_post_chenjin_contact_submit', 'chenjin_contact_submit');

function chenjin_contact_nickname_box($post) {
    $nickname = get_post_meta($post->ID, '_chenjin_contact_nickname', true);
    echo '<p>' . ($nickname !== '' ? esc_html($nickname) : '未填写') . '</p>';
}
function chenjin_contact_add_box() {
    add_meta_box('chenjin-contact-nickname', '访客昵称', 'chenjin_contact_nickname_box', 'chenjin_message', 'side');
}
add_action('add_meta_boxes', 'chenjin_contact_add_box');
