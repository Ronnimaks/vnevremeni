<?php
/**
 * Вход в личный кабинет: первый шаг.
 *
 * Отправляет заказчицу на GitHub подтвердить, что она это она. Обратно GitHub
 * вернёт её на callback.php с одноразовым кодом.
 *
 * Метка state кладётся в куку и потом сверяется на втором шаге — так чужой
 * человек не сможет подсунуть свой код и войти вместо неё.
 *
 * Раньше этот шаг был функцией на Cloudflare, переехал вместе с сайтом.
 */

declare(strict_types=1);

require __DIR__ . '/club-lib.php';

if (($_GET['provider'] ?? '') !== 'github') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Такой способ входа не поддерживается.');
}

$config = club_secrets();
if (empty($config['GITHUB_CLIENT_ID']) || empty($config['GITHUB_CLIENT_SECRET'])) {
    error_log('auth: в club-config.php нет ключей GitHub');
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Вход в кабинет ещё не настроен.');
}

$state = bin2hex(random_bytes(16));
setcookie('cms-state', $state, [
    'expires'  => time() + 600,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

$origin = 'https://' . ($_SERVER['HTTP_HOST'] ?? '');
$target = 'https://github.com/login/oauth/authorize?' . http_build_query([
    'client_id'    => $config['GITHUB_CLIENT_ID'],
    'redirect_uri' => $origin . '/callback',
    'scope'        => $_GET['scope'] ?? 'repo,user',
    'state'        => $state,
]);

header('Location: ' . $target, true, 302);
