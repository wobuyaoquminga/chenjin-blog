<?php
/**
 * Plugin Name: 陈今的 GitHub 项目
 * Description: 定时同步公开 GitHub 项目，并用短代码展示。
 * Version: 1.0.0
 * License: GPL-2.0-or-later
 * Text Domain: chenjin-github
 */

if (!defined('ABSPATH')) {
    exit;
}

const WS_GITHUB_USER = 'wobuyaoquminga';
const WS_GITHUB_DATA = 'ws_github_data';
const WS_GITHUB_ERROR = 'ws_github_error';
const WS_GITHUB_EVENT = 'ws_github_hourly_sync';

/** Fetch every public repository before replacing the last good snapshot. */
function ws_github_sync() {
    $repos = array();
    $old = get_option(WS_GITHUB_DATA, array());
    $old_releases = array();
    foreach ($old['repos'] ?? array() as $item) {
        if (is_array($item) && isset($item['name'], $item['release'])) {
            $old_releases[$item['name']] = $item['release'];
        }
    }
    $complete = false;
    for ($page = 1; $page <= 1000; $page++) {
        $url = 'https://api.github.com/users/' . WS_GITHUB_USER . '/repos?type=all&per_page=100&page=' . $page;
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'redirection' => 0,
            'headers' => array('Accept' => 'application/vnd.github+json', 'User-Agent' => 'chenjin-github-wordpress'),
        ));
        if (is_wp_error($response)) {
            return ws_github_fail('GitHub 连接失败。');
        }
        if (wp_remote_retrieve_response_code($response) !== 200) {
            return ws_github_fail('GitHub 返回错误状态：' . wp_remote_retrieve_response_code($response));
        }
        $batch = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($batch) || array_values($batch) !== $batch) {
            return ws_github_fail('GitHub 返回的数据格式无效。');
        }
        foreach ($batch as $repo) {
            if (!is_array($repo) || !isset($repo['id'], $repo['name'], $repo['owner']['login'], $repo['private'])
                || !is_int($repo['id']) || !is_string($repo['name'])
                || !is_string($repo['owner']['login']) || !is_bool($repo['private'])) {
                return ws_github_fail('GitHub 项目数据不完整。');
            }
            if ($repo['private'] || strcasecmp($repo['owner']['login'], WS_GITHUB_USER) !== 0) {
                continue;
            }
            if (!preg_match('/^[A-Za-z0-9._-]+$/D', $repo['name'])) {
                return ws_github_fail('GitHub 项目名称无效。');
            }
            $repos[$repo['id']] = array(
                'name' => $repo['name'],
                'description' => is_string($repo['description'] ?? null) ? $repo['description'] : '',
                'language' => is_string($repo['language'] ?? null) ? $repo['language'] : '',
                'stars' => max(0, (int) ($repo['stargazers_count'] ?? 0)),
                'updated_at' => is_string($repo['updated_at'] ?? null) ? $repo['updated_at'] : '',
                'archived' => !empty($repo['archived']),
                'fork' => !empty($repo['fork']),
                'issues' => !empty($repo['has_issues']),
                'branch' => is_string($repo['default_branch'] ?? null) ? $repo['default_branch'] : '',
                'homepage' => ws_github_homepage($repo['homepage'] ?? ''),
                'private' => false,
            );
        }
        if (count($batch) < 100) {
            $complete = true;
            break;
        }
    }
    if (!$complete) {
        return ws_github_fail('项目页数超过安全上限，旧数据已保留。');
    }
    $partial = 0;
    foreach ($repos as &$repo) {
        $release = ws_github_latest_release($repo['name']);
        if (is_wp_error($release)) {
            $partial++;
            $release = $old_releases[$repo['name']] ?? null;
        }
        $repo['release'] = $release;
    }
    unset($repo);
    update_option(WS_GITHUB_DATA, array('repos' => array_values($repos), 'updated_at' => time()), false);
    if ($partial) {
        update_option(WS_GITHUB_ERROR, array('message' => $partial . ' 个项目的发布资源暂未更新，已保留原有资源。', 'at' => time(), 'partial' => true), false);
    } else {
        delete_option(WS_GITHUB_ERROR);
    }
    return count($repos);
}

function ws_github_latest_release($name) {
    $url = 'https://api.github.com/repos/' . WS_GITHUB_USER . '/' . rawurlencode($name) . '/releases/latest';
    $response = wp_remote_get($url, array(
        'timeout' => 15,
        'redirection' => 0,
        'headers' => array('Accept' => 'application/vnd.github+json', 'User-Agent' => 'chenjin-github-wordpress'),
    ));
    if (is_wp_error($response)) {
        return $response;
    }
    $code = wp_remote_retrieve_response_code($response);
    if ($code === 404) {
        return null;
    }
    if ($code !== 200) {
        return new WP_Error('ws_github_release_failed', '发布资源请求失败。');
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data) || !isset($data['tag_name'], $data['assets'])
        || !is_string($data['tag_name']) || !is_array($data['assets'])) {
        return new WP_Error('ws_github_release_invalid', '发布资源格式无效。');
    }
    $prefix = '/' . WS_GITHUB_USER . '/' . $name . '/releases/download/';
    $assets = array();
    foreach ($data['assets'] as $asset) {
        if (!is_array($asset) || !is_string($asset['name'] ?? null)
            || !is_string($asset['browser_download_url'] ?? null)) {
            continue;
        }
        $url = $asset['browser_download_url'];
        $parts = wp_parse_url($url);
        if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https'
            || strtolower($parts['host'] ?? '') !== 'github.com'
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])
            || strpos($parts['path'] ?? '', $prefix) !== 0) {
            continue;
        }
        $assets[] = array('name' => $asset['name'], 'size' => max(0, (int) ($asset['size'] ?? 0)), 'url' => $url);
    }
    return array(
        'tag' => $data['tag_name'],
        'published_at' => is_string($data['published_at'] ?? null) ? $data['published_at'] : '',
        'assets' => $assets,
    );
}

function ws_github_homepage($url) {
    if (!is_string($url) || !$url || !wp_http_validate_url($url)) {
        return '';
    }
    $scheme = strtolower((string) wp_parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, array('http', 'https'), true) ? $url : '';
}

function ws_github_fail($message) {
    update_option(WS_GITHUB_ERROR, array('message' => $message, 'at' => time()), false);
    return new WP_Error('ws_github_sync_failed', $message);
}

function ws_github_activate() {
    if (!wp_next_scheduled(WS_GITHUB_EVENT)) {
        wp_schedule_event(time() + 60, 'hourly', WS_GITHUB_EVENT);
    }
}

register_activation_hook(__FILE__, 'ws_github_activate');
register_deactivation_hook(__FILE__, function () { wp_clear_scheduled_hook(WS_GITHUB_EVENT); });
add_action(WS_GITHUB_EVENT, 'ws_github_sync');

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('ws-github', plugins_url('projects.css', __FILE__), array(), '1.0.0');
    wp_enqueue_script('ws-github', plugins_url('projects.js', __FILE__), array(), '1.0.0', true);
});

function ws_github_shortcode($atts) {
    $atts = shortcode_atts(array('limit' => 0), $atts, 'ws_projects');
    $limit = max(0, min(1000, (int) $atts['limit']));
    $data = get_option(WS_GITHUB_DATA, array());
    $repos = isset($data['repos']) && is_array($data['repos']) ? $data['repos'] : array();
    $repos = array_values(array_filter($repos, function ($repo) {
        return is_array($repo) && !empty($repo['name']) && empty($repo['private']);
    }));
    usort($repos, function ($a, $b) use ($limit) {
        return $limit ? (($b['stars'] ?? 0) <=> ($a['stars'] ?? 0)) : strcmp($b['updated_at'] ?? '', $a['updated_at'] ?? '');
    });
    if ($limit) {
        $repos = array_slice($repos, 0, $limit);
    }
    $updated = !empty($data['updated_at']) ? wp_date('Y-m-d H:i', (int) $data['updated_at']) : '';
    $error = get_option(WS_GITHUB_ERROR, array());
    ob_start();
    ?>
    <section class="ws-projects" aria-label="GitHub 公开项目">
      <?php if ($updated) : ?><p class="ws-projects-meta">上次同步：<?php echo esc_html($updated); ?></p><?php endif; ?>
      <?php if (!empty($error['message'])) : ?><p class="ws-projects-error" role="status"><?php echo !empty($error['partial']) ? esc_html($error['message']) : '同步暂时失败，当前显示上次成功的数据。'; ?><?php echo $updated ? '上次同步：' . esc_html($updated) : '暂时没有可用的项目数据。'; ?></p><?php endif; ?>
      <?php if ($repos && !$limit) : ?>
        <div class="ws-projects-controls">
          <label>搜索项目 <input class="ws-project-search" type="search" placeholder="名称或描述" autocomplete="off"></label>
          <label>编程语言 <select class="ws-project-language"><option value="">全部语言</option><?php
            $languages = array_unique(array_filter(array_column($repos, 'language')));
            natcasesort($languages);
            foreach ($languages as $language) {
                echo '<option value="' . esc_attr($language) . '">' . esc_html($language) . '</option>';
            }
          ?></select></label>
          <label>排序方式 <select class="ws-project-sort"><option value="updated">最近更新</option><option value="stars">最多星标</option><option value="name">名称</option></select></label>
        </div>
      <?php endif; ?>
      <div class="ws-project-grid">
        <?php foreach ($repos as $repo) :
            $name = $repo['name'];
            $base = 'https://github.com/' . WS_GITHUB_USER . '/' . rawurlencode($name);
            $branch = $repo['branch'] ?? '';
            $date = !empty($repo['updated_at']) && strtotime($repo['updated_at']) ? wp_date('Y-m-d', strtotime($repo['updated_at'])) : '';
            $description = $repo['description'] ?: '暂无项目简介。';
            ?>
          <article class="ws-project-card" data-search="<?php echo esc_attr(strtolower($name . ' ' . $description)); ?>" data-language="<?php echo esc_attr($repo['language']); ?>" data-stars="<?php echo esc_attr((string) $repo['stars']); ?>" data-updated="<?php echo esc_attr($repo['updated_at']); ?>" data-name="<?php echo esc_attr(strtolower($name)); ?>">
            <h3><a href="<?php echo esc_url($base); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($name); ?></a></h3>
            <p class="ws-project-description"><?php echo esc_html($description); ?></p>
            <p class="ws-project-facts">
              <?php if ($repo['language']) : ?><span><?php echo esc_html($repo['language']); ?></span><?php endif; ?>
              <span>★ <?php echo esc_html((string) $repo['stars']); ?></span>
              <?php if ($date) : ?><span>更新于 <?php echo esc_html($date); ?></span><?php endif; ?>
              <?php if (!empty($repo['fork'])) : ?><span>派生项目</span><?php endif; ?>
              <?php if (!empty($repo['archived'])) : ?><span>已归档</span><?php endif; ?>
            </p>
            <?php if (!empty($repo['release']) && is_array($repo['release'])) : ?>
              <p class="ws-project-release">最新版本：<?php echo esc_html($repo['release']['tag'] ?? ''); ?><?php
                if (!empty($repo['release']['published_at']) && strtotime($repo['release']['published_at'])) {
                    echo ' · 发布于 ' . esc_html(wp_date('Y-m-d', strtotime($repo['release']['published_at'])));
                }
              ?></p>
              <?php if (!empty($repo['release']['assets'])) : ?><div class="ws-project-assets" aria-label="最新版本下载资源"><?php foreach ($repo['release']['assets'] as $asset) : ?>
                <a href="<?php echo esc_url($asset['url']); ?>" target="_blank" rel="noopener noreferrer">下载 <?php echo esc_html($asset['name']); ?><?php if (!empty($asset['size'])) : ?>（<?php echo esc_html(size_format($asset['size'], 1)); ?>）<?php endif; ?></a>
              <?php endforeach; ?></div><?php endif; ?>
            <?php endif; ?>
            <div class="ws-project-links">
              <a href="<?php echo esc_url($base); ?>" target="_blank" rel="noopener noreferrer">源码</a>
              <a href="<?php echo esc_url($base . '#readme'); ?>" target="_blank" rel="noopener noreferrer">README</a>
              <?php if (!empty($repo['issues'])) : ?><a href="<?php echo esc_url($base . '/issues'); ?>" target="_blank" rel="noopener noreferrer">议题</a><?php endif; ?>
              <a href="<?php echo esc_url($base . '/releases'); ?>" target="_blank" rel="noopener noreferrer">发布与附件</a>
              <?php if ($branch) : ?><a href="<?php echo esc_url('https://github.com/' . WS_GITHUB_USER . '/' . rawurlencode($name) . '/archive/refs/heads/' . rawurlencode($branch) . '.zip'); ?>">源码 ZIP</a><?php endif; ?>
              <?php if (!empty($repo['homepage'])) : ?><a href="<?php echo esc_url($repo['homepage']); ?>" target="_blank" rel="noopener noreferrer">项目网站</a><?php endif; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
      <?php if (!$repos) : ?><p class="ws-project-empty">暂无公开项目。<?php if (!$updated) : ?>请稍后刷新页面。<?php endif; ?></p><?php endif; ?>
      <?php if (!$limit && $repos) : ?><p class="ws-project-empty ws-project-filter-empty" hidden>没有符合条件的项目。</p><?php endif; ?>
    </section>
    <?php
    return ob_get_clean();
}
add_shortcode('ws_projects', 'ws_github_shortcode');

add_action('admin_menu', function () {
    add_options_page('GitHub 项目', 'GitHub 项目', 'manage_options', 'ws-github', 'ws_github_settings_page');
});

function ws_github_settings_page() {
    if (!current_user_can('manage_options')) {
        wp_die('权限不足。');
    }
    $data = get_option(WS_GITHUB_DATA, array());
    $error = get_option(WS_GITHUB_ERROR, array());
    echo '<div class="wrap"><h1>GitHub 项目同步</h1>';
    echo '<p>账号：' . esc_html(WS_GITHUB_USER) . '；公开项目数：' . esc_html((string) count($data['repos'] ?? array())) . '</p>';
    if (!empty($data['updated_at'])) {
        echo '<p>上次成功同步：' . esc_html(wp_date('Y-m-d H:i', (int) $data['updated_at'])) . '</p>';
    }
    if (!empty($error['message'])) {
        echo '<div class="notice notice-error"><p>' . esc_html($error['message']) . '</p></div>';
    }
    if (isset($_GET['ws_sync'])) {
        echo '<div class="notice notice-' . ($_GET['ws_sync'] === 'ok' ? 'success' : 'error') . '"><p>' . ($_GET['ws_sync'] === 'ok' ? '同步完成。' : '同步失败，已保留旧数据。') . '</p></div>';
    }
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
    echo '<input type="hidden" name="action" value="ws_github_sync">';
    wp_nonce_field('ws_github_sync');
    submit_button('立即同步');
    echo '</form><p>完整列表：<code>[ws_projects]</code>；精选项目：<code>[ws_projects limit="3"]</code></p></div>';
}

add_action('admin_post_ws_github_sync', function () {
    if (!current_user_can('manage_options')) {
        wp_die('权限不足。');
    }
    check_admin_referer('ws_github_sync');
    $result = ws_github_sync();
    wp_safe_redirect(add_query_arg('ws_sync', is_wp_error($result) ? 'error' : 'ok', admin_url('options-general.php?page=ws-github')));
    exit;
});

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('ws-github sync', function () {
        $result = ws_github_sync();
        if (is_wp_error($result)) {
            WP_CLI::error($result->get_error_message());
        }
        WP_CLI::success('已同步 ' . $result . ' 个公开项目。');
    });
}
