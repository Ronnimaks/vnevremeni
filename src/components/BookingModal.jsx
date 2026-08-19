import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Info, AlertCircle, AlertTriangle, CheckCircle, Copy, Check, Loader2, Send } from 'lucide-react';
import payment from '../data/payment.json';
import { submitBooking, newBookingId } from '../lib/booking';

const emptyForm = {
  name: '',
  phone: '',
  tickets: 1,
  consent: false,
  // Скрытая ловушка для ботов: человек это поле не видит и не заполняет.
  company: ''
};

const NAME_RE = /^[А-Яа-яЁёA-Za-z-]{2,}(\s+[А-Яа-яЁёA-Za-z-]{2,})+$/;

const onlyDigits = (value) => value.replace(/\D/g, '');

const formatPhone = (value) => {
  let digits = onlyDigits(value);
  if (!digits) return '';
  if (digits[0] === '8') digits = '7' + digits.slice(1);
  if (digits[0] !== '7') digits = '7' + digits;
  const rest = digits.slice(1, 11);
  let out = '+7';
  if (rest.length > 0) out += ' (' + rest.slice(0, 3);
  if (rest.length >= 3) out += ')';
  if (rest.length > 3) out += ' ' + rest.slice(3, 6);
  if (rest.length > 6) out += '-' + rest.slice(6, 8);
  if (rest.length > 8) out += '-' + rest.slice(8, 10);
  return out;
};

const isPhoneFilled = (value) => onlyDigits(value).length === 11;

const parsePrice = (value) => {
  const digits = onlyDigits(String(value ?? ''));
  return digits ? parseInt(digits, 10) : 0;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Safari до 13.4 и страницы без https не дают доступа к буферу обмена
    return false;
  }
};

// Запасной путь на случай, когда заявка не долетела до организатора: часть
// российских провайдеров режет адрес обработчика, а блокировщики рекламы —
// сам запрос. Тогда гость отправляет ту же заявку своими руками в Telegram,
// и она всё равно доходит.
const DeliveryFallback = ({ text, handle }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="bg-poet-accent/10 border border-poet-accent/30 rounded-lg p-4 space-y-3">
      <div className="flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-poet-accent shrink-0 mt-0.5" />
        <p className="text-xs text-poet-light/80 leading-relaxed">
          Заявка не ушла организатору автоматически — так бывает из-за провайдера или
          блокировщика рекламы. Отправьте её сами, одним нажатием: без этого о вас не узнают,
          даже если вы переведёте деньги.
        </p>
      </div>

      <a
        href={`https://t.me/${handle}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        Отправить заявку в Telegram
      </a>

      <button
        type="button"
        onClick={async () => setCopied(await copyToClipboard(text))}
        className="w-full py-2.5 text-sm text-poet-muted hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4 text-poet-accent" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Текст заявки скопирован' : 'Скопировать текст заявки'}
      </button>
    </div>
  );
};

const FieldError = ({ message }) => (
  <p className="flex items-center gap-1.5 text-xs text-poet-accent mt-1.5">
    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
    {message}
  </p>
);

const CopyButton = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => { if (await copyToClipboard(value)) setCopied(true); }}
      aria-label={label}
      className="flex items-center gap-1.5 text-xs font-medium text-poet-accent hover:text-white transition-colors shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Скопировано' : 'Копировать'}
    </button>
  );
};

export default function BookingModal({ event, isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [deliveryFailed, setDeliveryFailed] = useState(false);
  const dialogRef = useRef(null);
  const bookingIdRef = useRef(null);
  const sentCountRef = useRef(0);

  const resetAndClose = useCallback(() => {
    setStep(1);
    setForm(emptyForm);
    setErrors({});
    setIsSending(false);
    setDeliveryFailed(false);
    bookingIdRef.current = null;
    sentCountRef.current = 0;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetAndClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll('button, input, select, textarea, a[href]')
      ).filter(el => !el.disabled && el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = savedOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, resetAndClose]);

  if (!isOpen) return null;

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const basePrice = event?.ticketCategories?.length
    ? Math.min(...event.ticketCategories.map(cat => cat.price))
    : parsePrice(event?.price);
  const totalPrice = basePrice * form.tickets;
  const totalLabel = totalPrice.toLocaleString('ru-RU');

  const validate = () => {
    const found = {};
    const name = form.name.trim();
    if (!name) found.name = 'Укажите фамилию, имя и отчество';
    else if (!NAME_RE.test(name)) found.name = 'Напишите фамилию и имя полностью, только буквами';

    if (!form.phone) found.phone = 'Укажите номер телефона';
    else if (!isPhoneFilled(form.phone)) found.phone = 'Номер введён не полностью: +7 (999) 000-00-00';

    if (!form.consent) found.consent = 'Без согласия мы не можем принять заявку';

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const send = async (kind) => {
    if (!bookingIdRef.current) bookingIdRef.current = newBookingId();
    const result = await submitBooking({
      kind,
      bookingId: bookingIdRef.current,
      name: form.name.trim(),
      phone: form.phone,
      tickets: form.tickets,
      total: totalPrice,
      eventId: event?.id ?? '',
      eventTitle: event?.title ?? '',
      eventDate: event?.date ?? '',
      company: form.company
    });
    sentCountRef.current += 1;
    return result;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validate() || isSending) return;

    setIsSending(true);
    // Заявка уходит организатору до оплаты — со статусом «ждёт оплаты».
    const result = await send(sentCountRef.current === 0 ? 'new' : 'update');
    setIsSending(false);
    setDeliveryFailed(!result.ok);
    setStep(2);
  };

  const handlePaid = async () => {
    if (isSending) return;
    setIsSending(true);
    await send('paid');
    setIsSending(false);
    setStep(3);
  };

  const inputClass = (field) =>
    `w-full bg-black/30 border rounded px-4 py-3 text-white placeholder:text-poet-muted/60 focus:outline-none transition-colors ${
      errors[field] ? 'border-poet-accent/70 bg-poet-accent/5' : 'border-white/10 focus:border-poet-accent'
    }`;

  // Тот же состав, что уходит организатору автоматически — чтобы при ручной
  // отправке он получил ровно те же сведения и не пришлось ничего уточнять.
  const bookingText = [
    'Заявка с сайта клуба «Вне времени»',
    `Вечер: ${event?.title ?? ''}${event?.date ? ` (${event.date})` : ''}`,
    `Имя: ${form.name.trim()}`,
    `Телефон: ${form.phone}`,
    `Билетов: ${form.tickets}`,
    `К оплате: ${totalLabel} ₽`,
    bookingIdRef.current ? `Номер заявки: ${bookingIdRef.current}` : ''
  ].filter(Boolean).join('\n');

  const steps = [
    { num: 1, text: `Откройте приложение своего банка и выберите перевод по номеру телефона (СБП).` },
    { num: 2, text: `Введите номер ${payment.phone}. Банк получателя — ${payment.bank}, имя получателя — ${payment.recipient}. Обязательно сверьте имя перед отправкой.` },
    { num: 3, text: `Отправьте ровно ${totalLabel} ₽ и в сообщении к переводу укажите свою фамилию — так организатору проще вас найти.` }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <m.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-poet-card border border-white/10 rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden max-h-[90vh] flex flex-col focus:outline-none"
          >
            <button
              onClick={resetAndClose}
              aria-label="Закрыть окно"
              className="absolute top-4 right-4 text-poet-muted hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 overflow-y-auto min-h-0">
              <h3 id="booking-title" className="text-2xl font-serif font-bold text-white mb-2 pr-8">Оформление билета</h3>
              <p className="text-poet-accent text-sm">{event?.title}</p>

              <div className="flex gap-1.5 mt-5 mb-6">
                {[1, 2, 3].map(num => (
                  <span key={num} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${num <= step ? 'bg-poet-accent' : 'bg-white/10'}`} />
                ))}
              </div>

              {step === 1 && (
                <form onSubmit={handleNext} noValidate className="space-y-5">
                  <div className="bg-poet-accent/10 border border-poet-accent/20 rounded-lg p-4 flex gap-3 items-start">
                    <Info className="w-5 h-5 text-poet-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-poet-light/80 leading-relaxed">
                      Вход на вечер — по спискам, места распределяет организатор на месте. Пожалуйста, указывайте настоящие данные: по ним вас найдут в списке.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="booking-name" className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">ФИО гостя</label>
                    <input
                      id="booking-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={inputClass('name')}
                      placeholder="Иванов Иван Иванович"
                    />
                    {errors.name && <FieldError message={errors.name} />}
                  </div>

                  <div>
                    <label htmlFor="booking-phone" className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">Телефон</label>
                    <input
                      id="booking-phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', formatPhone(e.target.value))}
                      className={inputClass('phone')}
                      placeholder="+7 (999) 000-00-00"
                    />
                    {errors.phone
                      ? <FieldError message={errors.phone} />
                      : <p className="text-xs text-poet-muted mt-1.5">На этот номер организатор напишет в Telegram или WhatsApp, когда подтвердит оплату.</p>}
                  </div>

                  <div>
                    <label htmlFor="booking-tickets" className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">Количество билетов</label>
                    <select
                      id="booking-tickets"
                      value={form.tickets}
                      onChange={(e) => update('tickets', parseInt(e.target.value, 10))}
                      className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:border-poet-accent focus:outline-none transition-colors appearance-none"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num} className="bg-poet-card">{num}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ловушка для ботов: скрыта от людей и от скринридеров, боты её заполняют */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    className="absolute w-px h-px opacity-0 -z-10 pointer-events-none"
                  />

                  <div>
                    <label className="flex items-start gap-2.5 text-xs text-poet-light/80 cursor-pointer select-none leading-relaxed">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update('consent', e.target.checked)}
                        className="w-4 h-4 accent-poet-accent shrink-0 mt-0.5"
                      />
                      <span>
                        Согласен(на) на обработку персональных данных в соответствии с{' '}
                        <a href="./privacy.html" target="_blank" rel="noopener noreferrer" className="text-poet-accent hover:text-white transition-colors">политикой конфиденциальности</a>.
                      </span>
                    </label>
                    {errors.consent && <FieldError message={errors.consent} />}
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-white/10">
                    <span className="text-poet-muted">К оплате:</span>
                    <span className="text-xl font-bold text-white">{totalLabel} ₽</span>
                  </div>

                  <button type="submit" disabled={isSending} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSending ? 'Отправляем заявку…' : 'Перейти к оплате'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="bg-black/40 border border-white/5 rounded-lg p-5 text-center">
                    <p className="text-xs font-medium text-poet-muted mb-2 uppercase tracking-wider">К переводу</p>
                    <p className="text-4xl font-bold text-white mb-3">{totalLabel} ₽</p>
                    <p className="text-xs text-poet-muted">{form.tickets} {form.tickets === 1 ? 'билет' : 'билета(ов)'} × {basePrice.toLocaleString('ru-RU')} ₽</p>
                  </div>

                  {deliveryFailed && (
                    <DeliveryFallback text={bookingText} handle={payment.organizerTelegram} />
                  )}

                  <div className="bg-black/30 border border-white/5 rounded-lg divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-poet-muted mb-1">Номер телефона</p>
                        <p className="text-white font-medium tabular-nums">{payment.phone}</p>
                      </div>
                      <CopyButton value={payment.phoneDigits} label="Скопировать номер телефона" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-poet-muted mb-1">Банк получателя</p>
                      <p className="text-white font-medium">{payment.bank}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-poet-muted mb-1">Получатель</p>
                      <p className="text-white font-medium">{payment.recipient}</p>
                    </div>
                    <div className="p-4 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-poet-muted mb-1">Сумма</p>
                        <p className="text-white font-medium tabular-nums">{totalLabel} ₽</p>
                      </div>
                      <CopyButton value={String(totalPrice)} label="Скопировать сумму" />
                    </div>
                  </div>

                  {payment.qrImage && (
                    <div className="bg-black/40 border border-white/5 rounded-lg py-6 flex flex-col items-center">
                      <img src={payment.qrImage} alt={payment.qrAlt} className="w-44 h-44 bg-white rounded-lg p-3 object-contain" />
                      <p className="text-poet-muted text-xs mt-4 text-center px-4">
                        Если вы за компьютером — наведите на код камеру телефона. Сумму нужно будет ввести вручную.
                      </p>
                    </div>
                  )}

                  <ol className="space-y-3">
                    {steps.map(({ num, text }) => (
                      <li key={num} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full border border-poet-accent/40 text-poet-accent text-xs flex items-center justify-center shrink-0">{num}</span>
                        <p className="text-sm text-poet-light/80 leading-relaxed">{text}</p>
                      </li>
                    ))}
                  </ol>

                  <p className="text-xs text-poet-muted leading-relaxed">
                    Перевод по СБП проходит без комиссии. Заявка уже у организатора — если сейчас закроете страницу, ничего не потеряется.
                  </p>

                  {/* Условие согласовано с организатором: гость должен увидеть его до перевода, а не после. */}
                  <p className="text-xs text-poet-light/70 leading-relaxed border-l-2 border-poet-accent/40 pl-3">
                    Билет возврату не подлежит: если вы не сможете прийти, деньги не возвращаются.
                  </p>

                  <button onClick={handlePaid} disabled={isSending} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                    {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Я оплатил(а)
                  </button>
                  <button onClick={() => setStep(1)} className="w-full py-3 text-poet-muted hover:text-white transition-colors text-sm font-medium">
                    Изменить данные
                  </button>
                </m.div>
              )}

              {step === 3 && (
                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <CheckCircle className="w-14 h-14 text-poet-accent mx-auto mb-5" />
                  <h4 className="text-2xl font-serif font-bold text-white mb-3">Заявка принята</h4>
                  <p className="text-poet-muted text-sm leading-relaxed mb-6">
                    Организатор сверит поступление и напишет вам в Telegram или WhatsApp на указанный номер. Обычно это занимает несколько часов.
                  </p>

                  <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Заявка №</span>
                      <span className="text-poet-light text-right">{bookingIdRef.current}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Гость</span>
                      <span className="text-poet-light text-right break-words">{form.name.trim()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Вечер</span>
                      <span className="text-poet-light text-right break-words">{event?.title}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Билеты</span>
                      <span className="text-poet-light text-right">{form.tickets} шт. — {totalLabel} ₽</span>
                    </div>
                  </div>

                  {deliveryFailed && (
                    <div className="mb-6 text-left">
                      <DeliveryFallback text={bookingText} handle={payment.organizerTelegram} />
                    </div>
                  )}

                  <button onClick={resetAndClose} className="btn-outline">
                    Закрыть
                  </button>
                </m.div>
              )}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
