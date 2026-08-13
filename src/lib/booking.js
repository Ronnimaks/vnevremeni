// Отправка заявки организатору.
//
// Заявка уходит СРАЗУ после заполнения формы, до оплаты. Так ничего не теряется,
// если гость закроет вкладку: организатор всё равно знает, кто он и сколько должен был перевести.
// Нажатие «Я оплатил(а)» — второй сигнал, а не сама отправка.
//
// Адрес обработчика задаётся переменной сборки VITE_BOOKING_ENDPOINT (Cloudflare Worker).
// Токена бота в коде сайта нет и быть не может — он лежит на стороне Worker'а.
const ENDPOINT = import.meta.env.VITE_BOOKING_ENDPOINT || '';

export const isBookingDeliveryConfigured = () => Boolean(ENDPOINT);

const newBookingId = () => {
  const now = new Date();
  const stamp = [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join('');
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${stamp}-${tail}`;
};

export { newBookingId };

/**
 * @param {object} payload данные заявки
 * @param {'new'|'update'|'paid'} payload.kind что именно произошло
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function submitBooking(payload) {
  if (!ENDPOINT) return { ok: false, reason: 'not-configured' };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return { ok: false, reason: `http-${response.status}` };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
