import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const emptyForm = {
  name: '',
  phone: '',
  delivery: 'messenger',
  messenger: 'telegram',
  sameNumber: true,
  messengerPhone: '',
  email: '',
  tickets: 1
};

const NAME_RE = /^[А-Яа-яЁёA-Za-z-]{2,}(\s+[А-Яа-яЁёA-Za-z-]{2,})+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

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

// Декоративный узор для заглушки QR-кода: фиксированный, никаких платёжных данных внутри нет
const QR_GRID = 21;
const QR_MODULES = [];
for (let y = 0; y < QR_GRID; y++) {
  for (let x = 0; x < QR_GRID; x++) {
    const inFinder = (x < 8 && y < 8) || (x > QR_GRID - 9 && y < 8) || (x < 8 && y > QR_GRID - 9);
    if (inFinder) continue;
    let hash = (x * 374761393 + y * 668265263) >>> 0;
    hash = (hash ^ (hash >>> 13)) >>> 0;
    hash = (hash * 1274126177) >>> 0;
    hash = (hash ^ (hash >>> 16)) >>> 0;
    if (hash % 100 < 48) QR_MODULES.push([x, y]);
  }
}

const QrFinder = ({ x, y }) => (
  <g fill="#0f0f11">
    <rect x={x} y={y} width="7" height="7" rx="1" />
    <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
    <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.5" />
  </g>
);

const FieldError = ({ message }) => (
  <p className="flex items-center gap-1.5 text-xs text-poet-accent mt-1.5">
    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
    {message}
  </p>
);

export default function BookingModal({ event, isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);

  const resetAndClose = useCallback(() => {
    setStep(1);
    setForm(emptyForm);
    setErrors({});
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

  const validate = () => {
    const found = {};
    const name = form.name.trim();
    if (!name) found.name = 'Укажите фамилию, имя и отчество';
    else if (!NAME_RE.test(name)) found.name = 'Напишите фамилию и имя полностью, только буквами';

    if (!form.phone) found.phone = 'Укажите номер телефона';
    else if (!isPhoneFilled(form.phone)) found.phone = 'Номер введён не полностью: +7 (999) 000-00-00';

    if (form.delivery === 'messenger' && !form.sameNumber) {
      if (!form.messengerPhone) found.messengerPhone = 'Укажите номер, привязанный к мессенджеру';
      else if (!isPhoneFilled(form.messengerPhone)) found.messengerPhone = 'Номер введён не полностью: +7 (999) 000-00-00';
    }

    if (form.delivery === 'email') {
      const email = form.email.trim();
      if (!email) found.email = 'Укажите электронную почту';
      else if (!EMAIL_RE.test(email)) found.email = 'Похоже, в адресе опечатка. Пример: name@mail.ru';
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) setStep(2);
  };

  const handleComplete = () => {
    // TODO: здесь подключить отправку заявки, когда появится приём данных
    // (бот в Telegram, форма-сервис вроде Formspree или собственный обработчик).
    // Сейчас данные остаются в браузере и никуда не уходят.
    setStep(3);
  };

  const basePrice = event?.ticketCategories?.length
    ? Math.min(...event.ticketCategories.map(cat => cat.price))
    : parsePrice(event?.price);
  const totalPrice = basePrice * form.tickets;

  const messengerName = form.messenger === 'telegram' ? 'Telegram' : 'WhatsApp';
  const deliveryPhone = form.sameNumber ? form.phone : form.messengerPhone;
  const deliveryTarget = form.delivery === 'email'
    ? form.email.trim()
    : `${messengerName}, ${deliveryPhone}`;

  const inputClass = (field) =>
    `w-full bg-black/30 border rounded px-4 py-3 text-white placeholder:text-poet-muted/60 focus:outline-none transition-colors ${
      errors[field] ? 'border-poet-accent/70 bg-poet-accent/5' : 'border-white/10 focus:border-poet-accent'
    }`;

  const toggleClass = (active) =>
    `py-2.5 px-3 rounded text-sm font-medium transition-colors ${
      active ? 'bg-poet-accent text-poet-dark' : 'text-poet-muted hover:text-white'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
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
                      Вход на вечер — по спискам, места распределяет организатор на месте. Пожалуйста, указывайте настоящие данные.
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
                    {errors.phone && <FieldError message={errors.phone} />}
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">Куда прислать билет</span>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-black/30 border border-white/10 rounded">
                      <button type="button" onClick={() => update('delivery', 'messenger')} className={toggleClass(form.delivery === 'messenger')}>
                        В мессенджер
                      </button>
                      <button type="button" onClick={() => update('delivery', 'email')} className={toggleClass(form.delivery === 'email')}>
                        На почту
                      </button>
                    </div>
                  </div>

                  {form.delivery === 'messenger' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-1 p-1 bg-black/30 border border-white/10 rounded">
                        <button type="button" onClick={() => update('messenger', 'telegram')} className={toggleClass(form.messenger === 'telegram')}>
                          Telegram
                        </button>
                        <button type="button" onClick={() => update('messenger', 'whatsapp')} className={toggleClass(form.messenger === 'whatsapp')}>
                          WhatsApp
                        </button>
                      </div>

                      <label className="flex items-center gap-2.5 text-sm text-poet-light/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.sameNumber}
                          onChange={(e) => update('sameNumber', e.target.checked)}
                          className="w-4 h-4 accent-poet-accent"
                        />
                        Отправить на номер, указанный выше
                      </label>

                      {!form.sameNumber && (
                        <div>
                          <label htmlFor="booking-messenger-phone" className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">
                            Номер, привязанный к {messengerName}
                          </label>
                          <input
                            id="booking-messenger-phone"
                            type="tel"
                            inputMode="tel"
                            value={form.messengerPhone}
                            onChange={(e) => update('messengerPhone', formatPhone(e.target.value))}
                            className={inputClass('messengerPhone')}
                            placeholder="+7 (999) 000-00-00"
                          />
                          {errors.messengerPhone && <FieldError message={errors.messengerPhone} />}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="booking-email" className="block text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">Электронная почта</label>
                      <input
                        id="booking-email"
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className={inputClass('email')}
                        placeholder="name@mail.ru"
                      />
                      {errors.email && <FieldError message={errors.email} />}
                    </div>
                  )}

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

                  <div className="pt-4 flex justify-between items-center border-t border-white/10">
                    <span className="text-poet-muted">К оплате:</span>
                    <span className="text-xl font-bold text-white">{totalPrice} ₽</span>
                  </div>

                  <button type="submit" className="w-full btn-primary">
                    Перейти к оплате
                  </button>
                </form>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">Способ оплаты</p>
                      <p className="text-white font-medium">СБП — Система быстрых платежей</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-poet-muted mb-1 uppercase tracking-wider">К оплате</p>
                      <p className="text-xl font-bold text-white">{totalPrice} ₽</p>
                    </div>
                  </div>

                  <div className="bg-poet-accent/10 border border-poet-accent/30 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-poet-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-poet-light/80 leading-relaxed">
                      Приём оплаты ещё не подключён — это предварительный вид экрана. QR-код показан для примера, переводить деньги сейчас не нужно.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-lg py-6 flex flex-col items-center">
                    <div className="relative w-44 h-44 bg-white rounded-lg p-3">
                      <svg viewBox="0 0 21 21" className="w-full h-full" role="img" aria-label="Заглушка QR-кода">
                        <QrFinder x={0} y={0} />
                        <QrFinder x={14} y={0} />
                        <QrFinder x={0} y={14} />
                        {QR_MODULES.map(([x, y]) => (
                          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f0f11" />
                        ))}
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-poet-dark text-poet-light text-[10px] uppercase tracking-widest px-2.5 py-1 rounded">Образец</span>
                      </span>
                    </div>
                    <p className="text-poet-muted text-xs mt-4">Здесь будет QR-код для оплаты</p>
                  </div>

                  <ol className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full border border-poet-accent/40 text-poet-accent text-xs flex items-center justify-center shrink-0">1</span>
                      <p className="text-sm text-poet-light/80 leading-relaxed">Отсканируйте QR-код камерой телефона или в приложении банка — раздел «Оплата по QR».</p>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full border border-poet-accent/40 text-poet-accent text-xs flex items-center justify-center shrink-0">2</span>
                      <p className="text-sm text-poet-light/80 leading-relaxed">Проверьте сумму {totalPrice} ₽ и подтвердите перевод, затем вернитесь сюда.</p>
                    </li>
                  </ol>

                  <button onClick={handleComplete} className="w-full btn-primary">
                    Я оплатил(а)
                  </button>
                  <button onClick={() => setStep(1)} className="w-full py-3 text-poet-muted hover:text-white transition-colors text-sm font-medium">
                    Назад
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <CheckCircle className="w-14 h-14 text-poet-accent mx-auto mb-5" />
                  <h4 className="text-2xl font-serif font-bold text-white mb-3">Заявка заполнена</h4>
                  <p className="text-poet-muted text-sm leading-relaxed mb-6">
                    Сайт пока работает в предварительном режиме: оплата и отправка билетов ещё не подключены, поэтому заявка никуда не отправилась и билет не придёт.
                    Чтобы забронировать место сейчас, напишите организатору — <a href="#contacts" onClick={resetAndClose} className="text-poet-accent hover:text-white transition-colors">контакты в конце страницы</a>.
                  </p>

                  <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Гость</span>
                      <span className="text-poet-light text-right break-words">{form.name.trim()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Билеты</span>
                      <span className="text-poet-light text-right">{form.tickets} шт. — {totalPrice} ₽</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-poet-muted shrink-0">Билет придёт</span>
                      <span className="text-poet-light text-right break-words">{deliveryTarget}</span>
                    </div>
                  </div>

                  <button onClick={resetAndClose} className="btn-outline">
                    Закрыть
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
