import { useEffect } from 'react';

// Яндекс.Метрика. Включается только когда задан номер счётчика
// в переменной сборки VITE_METRIKA_ID — пока его нет, компонент ничего не делает.
// Так счётчик добавляется без правки кода: достаточно указать номер в настройках сборки.
const COUNTER_ID = import.meta.env.VITE_METRIKA_ID || '';

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
