<?php
/**
 * Маячок: сайт сам рассказывает нам, что у него не получилось.
 *
 * Зачем он нужен. Когда гость пишет «не открывается», у нас до сих пор не было
 * ни одной записи о том, что произошло. Журнал хостинга на этом тарифе доступен
 * только в панели и показывает лишь запросы — а нам нужно знать, что увидел
 * человек: приехала ли страница, доехали ли остальные файлы, нарисовалось ли
 * приложение. Об этом может рассказать только сама страница.
 *
 * Как устроено. В index.html вшит короткий скрипт — он работает даже тогда,
 * когда ни один внешний файл не доехал. Он присылает сюда короткие сообщения,
 * а мы складываем их в файл ВЫШЕ корня сайта, чтобы наружу он не отдавался.
 *
 * О тяжёлых случаях — когда приложение так и не нарисовалось — приходит
 * сообщение в Telegram, но не чаще раза в десять минут, чтобы не завалить его.
 */

declare(strict_types=1);

require __DIR__ . '/club-lib.php';

const MAYAK_MAX_BODY = 4096;      // больше короткого сообщения нам не нужно
const MAYAK_MAX_FILE = 2097152;   // 2 МБ, дальше журнал начинается заново
const MAYAK_LIMIT_PER_HOUR = 60;  // с одного адреса
const MAYAK_TELEGRAM_PAUSE = 600; // не чаще раза в 10 минут

function mayak_answer(int $code): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":true}';
    exit;
}

/** Папка для служебных файлов — выше корня сайта, наружу не отдаётся. */
function mayak_dir(): ?string
{
    foreach ([__DIR__ . '/..', __DIR__ . '/../..'] as $kandidat) {
        if (is_dir($kandidat) && is_writable($kandidat)) {
            return realpath($kandidat);
        }
    }
    return null;
}

/** Не больше MAYAK_LIMIT_PER_HOUR сообщений с адреса за час. При любой ошибке — пропускаем. */
function mayak_slishkom_chasto(string $ip): bool
{
    try {
        $dir = sys_get_temp_dir() . '/vnevremeni-mayak';
        if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
            return false;
        }
        $file = $dir . '/' . md5($ip) . '.json';
        $now = time();
        $state = ['start' => $now, 'count' => 0];
        if (is_readable($file)) {
            $saved = json_decode((string) @file_get_contents($file), true);
            if (is_array($saved) && isset($saved['start'], $saved['count']) && $now - $saved['start'] < 3600) {
                $state = $saved;
            }
        }
        $state['count']++;
        @file_put_contents($file, json_encode($state), LOCK_EX);
        return $state['count'] > MAYAK_LIMIT_PER_HOUR;
    } catch (\Throwable $e) {
        return false;
    }
}

/**
 * Тяжёлые случаи дублируем в Telegram, но с паузой: иначе один сломанный
 * робот-обходчик за минуту превратит переписку в ленту одинаковых сообщений.
 */
function mayak_v_telegram(string $text): void
{
    $config = club_secrets();

    // Технические сообщения идут ОТДЕЛЬНЫМ адресатом — разработчику, не заказчице.
    // TELEGRAM_CHAT_ID — это переписка заказчицы, туда приходят заявки на брони,
    // и засорять её сообщениями про недоехавшие файлы нельзя. Пока отдельный
    // адресат не задан, в Telegram не уходит ничего: запись всё равно ложится
    // в журнал, и мы её увидим.
    $komu = $config['TELEGRAM_DEV_CHAT_ID'] ?? '';
    if (empty($config['TELEGRAM_BOT_TOKEN']) || $komu === '') {
        return;
    }

    $metka = sys_get_temp_dir() . '/vnevremeni-mayak-tg';
    $now = time();
    if (is_readable($metka) && $now - (int) @file_get_contents($metka) < MAYAK_TELEGRAM_PAUSE) {
        return;
    }
    @file_put_contents($metka, (string) $now);

    $payload = json_encode([
        'chat_id'                  => $komu,
        'text'                     => $text,
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE);

    $curl = curl_init('https://api.telegram.org/bot' . $config['TELEGRAM_BOT_TOKEN'] . '/sendMessage');
    curl_setopt_array($curl, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
    ]);
    curl_exec($curl);
    curl_close($curl);
}

date_default_timezone_set('Europe/Moscow');

// Ответ всегда один и тот же и всегда успешный: маячок не должен ни задерживать
// страницу, ни привлекать к себе внимание, ни подсказывать чужому скрипту,
// что именно ему не понравилось.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    mayak_answer(405);
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > MAYAK_MAX_BODY) {
    mayak_answer(200);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    mayak_answer(200);
}

$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '?');
if (mayak_slishkom_chasto($ip)) {
    mayak_answer(200);
}

$dir = mayak_dir();
if ($dir === null) {
    mayak_answer(200);
}

$file = $dir . '/mayak.log';

// Журнал не должен разрастаться бесконечно: при переполнении оставляем
// предыдущий файл рядом и начинаем новый.
if (is_file($file) && filesize($file) > MAYAK_MAX_FILE) {
    @rename($file, $dir . '/mayak.log.1');
}

$obrezat = static fn($v, int $len) => mb_substr(preg_replace('/[\r\n\t]+/u', ' ', (string) $v), 0, $len);

$zapis = [
    'time'    => date('d.m.Y H:i:s'),
    'ip'      => $ip,
    'sobytie' => $obrezat($data['sobytie'] ?? '?', 40),
    'soobsh'  => $obrezat($data['soobsh'] ?? '', 300),
    'adres'   => $obrezat($data['adres'] ?? '', 200),
    'sboi'    => $obrezat(is_array($data['sboi'] ?? null) ? implode(', ', $data['sboi']) : ($data['sboi'] ?? ''), 400),
    'ms'      => (int) ($data['ms'] ?? 0),
    'ekran'   => $obrezat($data['ekran'] ?? '', 20),
    'ua'      => $obrezat($_SERVER['HTTP_USER_AGENT'] ?? '', 200),
];

@file_put_contents($file, json_encode($zapis, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

if ($zapis['sobytie'] === 'belyj-ekran') {
    mayak_v_telegram(
        "⚠️ <b>Сайт не нарисовался у посетителя</b>\n\n"
        . '<b>Когда:</b> ' . $zapis['time'] . " МСК\n"
        . '<b>Не доехало:</b> ' . ($zapis['sboi'] !== '' ? $zapis['sboi'] : 'не определено') . "\n"
        . '<b>Ждал:</b> ' . $zapis['ms'] . " мс\n"
        . '<b>Устройство:</b> ' . $zapis['ua'] . "\n"
        . '<b>Экран:</b> ' . $zapis['ekran']
    );
}

mayak_answer(200);
