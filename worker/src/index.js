// Обработчик заявок с сайта клуба «Вне времени».
//
// Принимает заявку от формы бронирования и пересылает её организатору в Telegram.
// Токен бота хранится в секретах Worker'а и в код сайта никогда не попадает —
// именно ради этого обработчик и существует.
//
// Секреты (wrangler secret put):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id чата организатора
// Переменные (wrangler.toml):
//   ALLOWED_ORIGINS    — домены сайта через запятую

const MAX_BODY_BYTES = 2048;

const KIND_TITLES = {
  new: '🕐 НОВАЯ ЗАЯВКА — ждёт оплаты',
  update: '✏️ ЗАЯВКА ИЗМЕНЕНА — ждёт оплаты',
  paid: '✅ ГОСТЬ НАЖАЛ «Я ОПЛАТИЛ» — проверьте поступление'
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const allowedOrigins = (env) =>
  (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const corsHeaders = (request, env) => {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
  if (allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
};

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

// Возвращает текст ошибки или null, если заявка выглядит настоящей.
const findProblem = (data) => {
  if (!data || typeof data !== 'object') return 'bad-json';
  // Ловушка для ботов: у человека это поле всегда пустое.
  if (data.company) return 'spam';
  if (!KIND_TITLES[data.kind]) return 'bad-kind';

  const name = String(data.name ?? '').trim();
  if (name.length < 3 || name.length > 100) return 'bad-name';

  if (onlyDigits(data.phone).length !== 11) return 'bad-phone';

  const tickets = Number(data.tickets);
  if (!Number.isInteger(tickets) || tickets < 1 || tickets > 20) return 'bad-tickets';

  const total = Number(data.total);
  if (!Number.isFinite(total) || total < 0 || total > 1000000) return 'bad-total';

  if (String(data.eventTitle ?? '').length > 200) return 'bad-event';
  return null;
};

const moscowTime = () =>
  new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

const buildMessage = (data) => {
  const phone = '+' + onlyDigits(data.phone);
  const total = Number(data.total).toLocaleString('ru-RU');
  const lines = [
    `<b>${KIND_TITLES[data.kind]}</b>`,
    '',
    `<b>Вечер:</b> ${escapeHtml(data.eventTitle || '—')}`,
    data.eventDate ? `<b>Дата вечера:</b> ${escapeHtml(data.eventDate)}` : null,
    '',
    `<b>Гость:</b> ${escapeHtml(data.name.trim())}`,
    `<b>Телефон:</b> <a href="tel:${phone}">${escapeHtml(data.phone)}</a>`,
    `<b>Билетов:</b> ${data.tickets}`,
    `<b>Сумма:</b> ${total} ₽`,
    '',
    `<b>Заявка №</b> ${escapeHtml(data.bookingId || '—')}`,
    `<i>Получено ${moscowTime()} МСК</i>`
  ];
  if (data.kind === 'paid') {
    lines.push('', '⚠️ Гость сообщил об оплате. Сверьте поступление в банке.');
  }
  return lines.filter(line => line !== null).join('\n');
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'method-not-allowed' }, 405, cors);
    if (!cors['Access-Control-Allow-Origin']) return json({ error: 'origin-not-allowed' }, 403, cors);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'too-large' }, 413, cors);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ error: 'bad-json' }, 400, cors);
    }

    const problem = findProblem(data);
    // Спам-ботам отвечаем «ок», чтобы они не подбирали формат и не пробовали снова.
    if (problem === 'spam') return json({ ok: true }, 200, cors);
    if (problem) return json({ error: problem }, 400, cors);

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: buildMessage(data),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      // Подробности в лог Worker'а, наружу — только факт неудачи.
      console.error('telegram-failed', response.status, await response.text());
      return json({ error: 'delivery-failed' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};
