<?php
/**
 * Приём заявок с сайта клуба «Вне времени».
 *
 * Принимает заявку от формы бронирования и пересылает её организатору в Telegram.
 * Токен бота в код сайта не попадает никогда — ради этого обработчик и существует.
 *
 * Раньше это была функция на Cloudflare. От Cloudflare пришлось уйти: российские
 * провайдеры режут соединения к зарубежным сетям после первых 16 КБ, и сайт
 * не догружался у большинства гостей. Теперь всё живёт на российском хостинге.
 *
 * Токены лежат в club-config.php ВЫШЕ корня сайта — оттуда их не отдаст веб-сервер,
 * даже если ошибиться в настройках. Файл кладётся на хостинг один раз руками
 * и в репозиторий не попадает.
 */

declare(strict_types=1);

require __DIR__ . '/club-lib.php';

const MAX_BODY_BYTES = 2048;

const KIND_TITLES = [
    'new'    => '🕐 НОВАЯ ЗАЯВКА — ждёт оплаты',
    'update' => '✏️ ЗАЯВКА ИЗМЕНЕНА — ждёт оплаты',
    'paid'   => '✅ ГОСТЬ НАЖАЛ «Я ОПЛАТИЛ» — проверьте поступление',
];

function respond(array $body, int $status): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function onlyDigits($value): string
{
    return preg_replace('/\D/', '', (string) $value) ?? '';
}

/** Возвращает код ошибки или null, если заявка выглядит настоящей. */
function findProblem($data): ?string
{
    if (!is_array($data)) {
        return 'bad-json';
    }
    // Ловушка для ботов: у человека это поле всегда пустое.
    if (!empty($data['company'])) {
        return 'spam';
    }
    if (!isset($data['kind']) || !isset(KIND_TITLES[$data['kind']])) {
        return 'bad-kind';
    }

    $name = trim((string) ($data['name'] ?? ''));
    $length = mb_strlen($name);
    if ($length < 3 || $length > 100) {
        return 'bad-name';
    }

    if (strlen(onlyDigits($data['phone'] ?? '')) !== 11) {
        return 'bad-phone';
    }

    $tickets = $data['tickets'] ?? null;
    if (!is_int($tickets) && !(is_string($tickets) && ctype_digit($tickets))) {
        return 'bad-tickets';
    }
    $tickets = (int) $tickets;
    if ($tickets < 1 || $tickets > 20) {
        return 'bad-tickets';
    }

    $total = $data['total'] ?? null;
    if (!is_numeric($total) || $total < 0 || $total > 1000000) {
        return 'bad-total';
    }

    if (mb_strlen((string) ($data['eventTitle'] ?? '')) > 200) {
        return 'bad-event';
    }

    return null;
}

function buildMessage(array $data): string
{
    $esc = static function ($value) {
        return htmlspecialchars((string) $value, ENT_NOQUOTES, 'UTF-8');
    };

    $phone = '+' . onlyDigits($data['phone']);
    $total = number_format((float) $data['total'], 0, ',', ' ');

    $lines = [
        '<b>' . KIND_TITLES[$data['kind']] . '</b>',
        '',
        '<b>Вечер:</b> ' . $esc($data['eventTitle'] ?? '—'),
    ];
    if (!empty($data['eventDate'])) {
        $lines[] = '<b>Дата вечера:</b> ' . $esc($data['eventDate']);
    }
    array_push(
        $lines,
        '',
        '<b>Гость:</b> ' . $esc(trim((string) $data['name'])),
        '<b>Телефон:</b> <a href="tel:' . $esc($phone) . '">' . $esc($data['phone']) . '</a>',
        '<b>Билетов:</b> ' . (int) $data['tickets'],
        '<b>Сумма:</b> ' . $total . ' ₽',
        '',
        '<b>Заявка №</b> ' . $esc($data['bookingId'] ?? '—'),
        '<i>Получено ' . date('d.m H:i') . ' МСК</i>'
    );

    if ($data['kind'] === 'paid') {
        array_push($lines, '', '⚠️ Гость сообщил об оплате. Сверьте поступление в банке.');
    }

    return implode("\n", $lines);
}

function sendToTelegram(string $text, array $config): bool
{
    $url = 'https://api.telegram.org/bot' . $config['TELEGRAM_BOT_TOKEN'] . '/sendMessage';
    $payload = json_encode([
        'chat_id'                  => $config['TELEGRAM_CHAT_ID'],
        'text'                     => $text,
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE);

    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $body = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($status !== 200) {
        // Подробности в лог хостинга, наружу — только факт неудачи.
        error_log('telegram-failed ' . $status . ' ' . ($error !== '' ? $error : (string) $body));
        return false;
    }

    return true;
}

date_default_timezone_set('Europe/Moscow');

// Форма и обработчик теперь на одном домене, так что эти заголовки нужны
// только для запасного адреса и для предполётных запросов браузера.
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? ('https://' . ($_SERVER['HTTP_HOST'] ?? ''))));

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['error' => 'method-not-allowed'], 405);
}

$raw = file_get_contents('php://input');
if ($raw === false) {
    $raw = '';
}
if (strlen($raw) > MAX_BODY_BYTES) {
    respond(['error' => 'too-large'], 413);
}

$data = json_decode($raw, true);
$problem = findProblem($data);

// Спам-ботам отвечаем «ок», чтобы они не подбирали формат и не пробовали снова.
if ($problem === 'spam') {
    respond(['ok' => true], 200);
}
if ($problem !== null) {
    respond(['error' => $problem], 400);
}

$config = club_secrets();
if (empty($config['TELEGRAM_BOT_TOKEN']) || empty($config['TELEGRAM_CHAT_ID'])) {
    error_log('booking: club-config.php не найден или пуст');
    respond(['error' => 'not-configured'], 500);
}

if (!sendToTelegram(buildMessage($data), $config)) {
    respond(['error' => 'delivery-failed'], 502);
}

respond(['ok' => true], 200);
