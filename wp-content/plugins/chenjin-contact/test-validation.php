<?php
// Run with: php test-validation.php
define('ABSPATH', __DIR__);
function add_action() {}
function add_shortcode() {}
require __DIR__ . '/chenjin-contact.php';

$cases = array(
    array('', '主题', '正文', true),
    array('昵称', '主题', '　 ', false),
    array('', '', '正文', false),
    array('', str_repeat('a', 121), '正文', false),
    array('', '主题', str_repeat('a', 5001), false),
    array(array(), '主题', '正文', false),
);
foreach ($cases as $case) {
    if (chenjin_contact_validate($case[0], $case[1], $case[2]) !== $case[3]) {
        throw new RuntimeException('Validation failed');
    }
}
echo "validation OK\n";
