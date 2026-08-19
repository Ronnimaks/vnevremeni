import { useEffect } from 'react';

// Яндекс.Метрика.
//
// Номер счётчика не секрет — он всё равно виден в исходниках любой страницы,
// поэтому держим его прямо здесь, а не в настройках сборки. Настройку легко забыть
// выставить на сервере сборки, и счётчик тогда молча не заводится — так уже было.
// VITE_METRIKA_ID оставлен на случай, если понадобится другой счётчик.
const COUNTER_ID = import.meta.env.VITE_METRIKA_ID || '111608134';

// Счётчик подключается не сразу, а когда телефон освободится.
//
// Замер показал: скрипт Метрики отъедал около полусекунды процессорного времени
// ровно в тот момент, когда браузер и без него не справлялся — рисовал страницу.
// Гостю от этого страница открывалась медленнее, а нам счётчик не стал бы точнее.
//
// Ждём одного из трёх: браузер сообщил, что свободен; человек тронул страницу;
// прошло три с половиной секунды. Что случится первым — то и запускает счётчик.
// Визит при этом не теряется: Метрика засчитывает его в момент подключения.
function kogdaOsvoboditsya(delo) {
  let sdelano = false;
  const zapustit = () => {
    if (sdelano) return;
    sdelano = true;
    ubrat();
    delo();
  };

  const sobytiya = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  const ubrat = () => sobytiya.forEach((s) => window.removeEventListener(s, zapustit));
  sobytiya.forEach((s) => window.addEventListener(s, zapustit, { once: true, passive: true }));

  const zapas = setTimeout(zapustit, 3500);

  if ('requestIdleCallback' in window) {
    requestIdleCallback(zapustit, { timeout: 3500 });
  }

  return () => {
    clearTimeout(zapas);
    ubrat();
  };
}

export default function Metrika() {
  useEffect(() => {
    if (!COUNTER_ID || window.ym) return;

    return kogdaOsvoboditsya(() => {
      if (window.ym) return;

      window.ym = window.ym || function (...args) { (window.ym.a = window.ym.a || []).push(args); };
      window.ym.l = Date.now();

      const script = document.createElement('script');
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      script.async = true;
      document.head.appendChild(script);

      window.ym(COUNTER_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    });
  }, []);

  return null;
}
