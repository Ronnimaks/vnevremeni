import { useEffect } from 'react';

// Яндекс.Метрика.
//
// Номер счётчика не секрет — он всё равно виден в исходниках любой страницы,
// поэтому держим его прямо здесь, а не в настройках сборки. Настройку легко забыть
// выставить на сервере сборки, и счётчик тогда молча не заводится — так уже было.
// VITE_METRIKA_ID оставлен на случай, если понадобится другой счётчик.
const COUNTER_ID = import.meta.env.VITE_METRIKA_ID || '111608134';

export default function Metrika() {
  useEffect(() => {
    if (!COUNTER_ID || window.ym) return;

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
  }, []);

  return null;
}
