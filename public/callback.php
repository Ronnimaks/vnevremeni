<?php
/**
 * Вход в личный кабинет: второй шаг.
 *
 * Сюда GitHub возвращает человека после подтверждения. Меняем одноразовый код
 * на ключ доступа и передаём его окну кабинета. Ключ живёт только в браузере
 * и никуда больше не сохраняется — ни в базу, ни в файлы, ни в логи.
 */

declare(strict_types=1);

require __DIR__ . '/club-lib.php';

/**
 * Ответ всплывающему окну. Кабинет ждёт именно такой обмен сообщениями:
 * сначала «я авторизуюсь», потом результат — иначе он не поймёт, что вход прошёл.
 */
function reply(string $payload): void
{
    // Метку больше не используем — гасим её сразу.
    setcookie('cms-state', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    header('Content-Type: text/html; charset=utf-8');
    $message = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    echo <<<HTML
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход в кабинет</title></head>
<body style="font-family: system-ui, sans-serif; background:#0f0f11; color:#f5f5f5; padding:2rem">
<p>Можно закрыть это окно.</p>
<script>
  (function () {
    var message = {$message};
    function send(event) {
      window.opener.postMessage(message, event.origin);
      window.removeEventListener('message', send, false);
    }
    if (window.opener) {
      window.addEventListener('message', send, false);
      window.opener.postMessage('authorizing:github', '*');
    }
  })();
</script>
</body>
</html>
HTML;
    exit;
}

function failure(string $reason): void
{
    reply('authorization:github:error:' . json_encode(['message' => $reason], JSON_UNESCAPED_UNICODE));
}

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';
$saved = $_COOKIE['cms-state'] ?? '';

if ($code === '') {
    failure('GitHub не вернул код подтверждения');
}
if ($state === '' || $saved === '' || !hash_equals($saved, $state)) {
    failure('Проверка подлинности не прошла, попробуйте войти заново');
}

$config = club_secrets();
$origin = 'https://' . ($_SERVER['HTTP_HOST'] ?? '');

$curl = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($curl, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode([
        'client_id'     => $config['GITHUB_CLIENT_ID'] ?? '',
        'client_secret' => $config['GITHUB_CLIENT_SECRET'] ?? '',
        'code'          => $code,
        'redirect_uri'  => $origin . '/callback',
    ]),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

if ($status !== 200 || !is_string($body)) {
    error_log('github-token-failed ' . $status);
    failure('GitHub не ответил, попробуйте ещё раз');
}

$data = json_decode($body, true);
if (!is_array($data) || empty($data['access_token'])) {
    // Сам ответ не пишем в лог: в нём может оказаться ключ.
    error_log('github-token-missing ' . (is_array($data) ? ($data['error'] ?? '?') : '?'));
    failure(is_array($data) && !empty($data['error_description'])
        ? (string) $data['error_description']
        : 'GitHub не выдал ключ доступа');
}

reply('authorization:github:success:' . json_encode([
    'token'    => $data['access_token'],
    'provider' => 'github',
], JSON_UNESCAPED_UNICODE));
