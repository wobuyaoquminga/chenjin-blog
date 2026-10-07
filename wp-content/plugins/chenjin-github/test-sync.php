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

require __DIR__ . '/chenjin-github.php';

function repo($id, $private = false) {
    return array('id' => $id, 'name' => 'repo-' . $id, 'owner' => array('login' => WS_GITHUB_USER),
        'private' => $private, 'description' => '', 'language' => 'PHP', 'stargazers_count' => $id,
        'updated_at' => '2026-01-01T00:00:00Z', 'archived' => false, 'fork' => true,
        'has_issues' => true, 'default_branch' => 'feature/one', 'homepage' => 'https://example.org');
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
$responses = array(response(array(repo(1))), response(array(), 503));
check(ws_github_sync() === 1, 'Partial release failure interrupted repository sync');
$partial = get_option(WS_GITHUB_DATA);
check($partial['repos'][0]['release'] === $snapshot['repos'][0]['release'], 'Old release was not preserved');
check(!empty(get_option(WS_GITHUB_ERROR)['partial']), 'Partial release failure was not reported');
$responses = array(response(array(repo(999)), 403));
check(is_wp_error(ws_github_sync()), 'HTTP failure was ignored');
check(get_option(WS_GITHUB_DATA) === $partial, 'Failure replaced the last good snapshot');
check((bool) get_option(WS_GITHUB_ERROR), 'Failure status was not saved');
echo "同步检查通过\n";
