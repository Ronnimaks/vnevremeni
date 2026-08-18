<?php
/**
 * Общее для серверной части сайта: чтение секретов.
 *
 * Сам по себе файл ничего не делает и ничего не выводит — только объявляет
 * функцию. Открыть его в браузере безопасно: получится пустая страница.
 */

declare(strict_types=1);

/**
 * Токены и ключи лежат в club-config.php ВЫШЕ корня сайта. Веб-сервер оттуда
 * ничего не отдаёт, даже если ошибиться в настройках. Файл кладётся на хостинг
 * один раз руками и в репозиторий не попадает — иначе токен бота стал бы
 * достоянием всех, у кого есть доступ к коду.
 *
 * Путей несколько, потому что у разных хостеров корень сайта лежит на разной глубине.
 */
function club_secrets(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    foreach (['/../club-config.php', '/../../club-config.php'] as $path) {
        $file = __DIR__ . $path;
        if (is_readable($file)) {
            $loaded = require $file;
            if (is_array($loaded)) {
                return $cache = $loaded;
            }
        }
    }

    // Запасной путь: переменные окружения. Пригодится, если хостер даёт их задавать.
    $names = [
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_CHAT_ID',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
    ];
    $cache = [];
    foreach ($names as $name) {
        $cache[$name] = getenv($name) ?: '';
    }

    return $cache;
}
