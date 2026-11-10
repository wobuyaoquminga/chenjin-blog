<?php
// Run with: php test-sync.php
define('ABSPATH', __DIR__);
$options = array();
$requests = array();
$responses = array();
class WP_Error {
    private $message;
    public function __construct($code, $message) { $this->message = $message; }
    public function get_error_message() { return $this->message; }
}
function is_wp_error($value) { return $value instanceof WP_Error; }
function wp_remote_get($url, $args) {
    global $requests, $responses;
    $requests[] = array($url, $args);
    return array_shift($responses);
}
function wp_remote_retrieve_response_code($response) { return $response['code']; }
function wp_remote_retrieve_body($response) { return $response['body']; }
function update_option($key, $value, $autoload = null) { global $options; $options[$key] = $value; }
function delete_option($key) { global $options; unset($options[$key]); }
function get_option($key, $default = false) { global $options; return $options[$key] ?? $default; }
function wp_http_validate_url($url) { return preg_match('~^https?://[^/]+~i', $url) ? $url : false; }
function wp_parse_url($url, $part = -1) { return parse_url($url, $part); }
function register_activation_hook($file, $callback) {}
function register_deactivation_hook($file, $callback) {}
function add_action($hook, $callback) {}
function add_shortcode($name, $callback) {}
function esc_html($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); }
function esc_attr($value) { return esc_html($value); }
function esc_url($value) { return esc_html($value); }
function wp_date($format, $time = null) { return gmdate($format, $time ?? time()); }
function shortcode_atts($defaults, $atts, $name) { return array_merge($defaults, $atts); }
function size_format($size, $precision) { return (string) $size; }

function home_url($path = '') { return 'https://example.test/blog/' . ltrim($path, '/'); }
function add_query_arg($key, $value, $url) { return $url . (strpos($url, '?') === false ? '?' : '&') . rawurlencode($key) . '=' . rawurlencode($value); }
require __DIR__ . '/chenjin-github.php';

function repo($id, $private = false) {
    return array('id' => $id, 'name' => 'repo-' . $id, 'owner' => array('login' => WS_GITHUB_USER),
        'private' => $private, 'description' => '', 'language' => 'PHP', 'stargazers_count' => $id,
        'updated_at' => '2026-01-01T00:00:00Z', 'archived' => false, 'fork' => true,
        'has_issues' => true, 'default_branch' => 'feature/one', 'homepage' => 'https://example.org',
        'topics' => array('offline-first', '<script>bad</script>', 42),
        'license' => array('spdx_id' => 'MIT'), 'forks_count' => 3,
        'created_at' => '2025-01-01T00:00:00Z', 'pushed_at' => '2026-01-01T00:00:00Z');
}
function response($body, $code = 200) { return array('code' => $code, 'body' => json_encode($body)); }
function check($condition, $message) { if (!$condition) { throw new Exception($message); } }

$first = array();
for ($i = 1; $i <= 100; $i++) { $first[] = repo($i, $i === 7); }
$responses = array(response($first), response(array(repo(101), repo(102, true))));
for ($i = 1; $i <= 101; $i++) {
    if ($i === 7 || $i === 102) { continue; }
    $responses[] = $i === 1 ? response(array('tag_name' => 'v1', 'published_at' => '2026-01-01T00:00:00Z', 'assets' => array(
        array('name' => 'app.apk', 'size' => 1024, 'browser_download_url' => 'https://github.com/' . WS_GITHUB_USER . '/repo-1/releases/download/v1/app.apk'),
        array('name' => 'bad.zip', 'size' => 1, 'browser_download_url' => 'https://example.com/bad.zip'),
    ))) : response(array(), 404);
}
check(ws_github_sync() === 100, 'Pagination or private filtering failed');
$snapshot = get_option(WS_GITHUB_DATA);
check(count($snapshot['repos']) === 100 && $snapshot['repos'][6]['name'] === 'repo-8', 'Wrong cached repositories');
check(count($requests) === 102 && strpos($requests[1][0], 'page=2') !== false, 'Page 2 or releases were not fetched');
check($requests[0][1]['redirection'] === 0, 'Redirects must be disabled');
check(count($snapshot['repos'][0]['release']['assets']) === 1, 'Release asset URL validation failed');
check($snapshot['repos'][0]['topics'] === array('offline-first'), 'Untrusted topic data was not filtered');
check($snapshot['repos'][0]['license'] === 'MIT' && $snapshot['repos'][0]['forks'] === 3, 'Project metadata missing');
$responses = array(response(array(repo(1))), response(array(), 503));
check(ws_github_sync() === 1, 'Partial release failure interrupted repository sync');
$partial = get_option(WS_GITHUB_DATA);
check($partial['repos'][0]['release'] === $snapshot['repos'][0]['release'], 'Old release was not preserved');
check(!empty(get_option(WS_GITHUB_ERROR)['partial']), 'Partial release failure was not reported');
$responses = array(response(array(repo(999)), 403));
check(is_wp_error(ws_github_sync()), 'HTTP failure was ignored');
check(get_option(WS_GITHUB_DATA) === $partial, 'Failure replaced the last good snapshot');
check((bool) get_option(WS_GITHUB_ERROR), 'Failure status was not saved');

$base = 'https://github.com/' . WS_GITHUB_USER . '/repo-1';
$profile = array(
    'features' => array('<script>alert(1)</script>'),
    'getting_started' => array('Download from the repository'),
    'notes' => array('Only reviewed public information'),
    'links' => array(
        array('label' => 'Valid documentation', 'url' => $base . '/blob/main/README.md'),
        array('label' => 'External link', 'url' => 'https://example.com/private'),
        array('label' => 'Injected link', 'url' => 'javascript:alert(1)'),
    ),
    'verified_on' => '2026-11-05',
);
ob_start();
ws_github_render_details($snapshot['repos'][0], $profile, $base);
$html = ob_get_clean();
check(strpos($html, '<script>') === false && strpos($html, '&lt;script&gt;') !== false, 'Detail content must be escaped');
check(strpos($html, 'Valid documentation') !== false && strpos($html, 'example.com/private') === false && strpos($html, 'javascript:') === false, 'Detail links must stay in the public repository');
check(strpos($html, '<ol>') !== false && strpos($html, 'MIT') !== false && strpos($html, '2025-01-01') !== false, 'Detail sections or metadata missing');
check(ws_github_project_details('unknown-future-project') === array(), 'New projects must have a safe detail fallback');
check(!empty(ws_github_project_details('chenjin-blog')['features']), 'Reviewed project catalog missing');
$page = ws_github_shortcode(array());
check(strpos($page, 'ws-project-details') !== false && strpos($page, 'README') !== false, 'Existing cached projects must render details without re-sync');
check(strpos(ws_github_render_project_page('repo-1'), 'app.apk') !== false, 'Standalone project must retain validated release downloads');
foreach (array('missing', '../repo-1', '<script>', array('repo-1')) as $invalid) {
    check(ws_github_render_project_page($invalid) === false, 'Unknown or malformed project must not render');
}
$private = $partial['repos'][0];
$private['name'] = 'private-project';
$private['private'] = true;
$options[WS_GITHUB_DATA]['repos'][] = $private;
check(ws_github_render_project_page('private-project') === false, 'Private cached repository must not render');
echo "同步检查通过\n";
