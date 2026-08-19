import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Файл оформления не должен задерживать первую отрисовку.
 *
 * Обычная строка <link rel="stylesheet"> заставляет браузер ждать: пока файл
 * не приехал, на экране не появляется ничего — ни текста, ни фона. Замер
 * показал цепочку «страница 1,9 с → оформление 2,4 с → первая картинка»,
 * а при обрыве связи ожидание становится бесконечным: страница с текстом
 * уже лежит на устройстве, но человек видит белый лист.
 *
 * Приём стандартный: помечаем файл как предназначенный для печати — такие
 * браузер грузит, но отрисовку ими не задерживает, — а когда он приехал,
 * возвращаем ему обычное назначение. Запасная строка в <noscript> нужна для
 * браузеров с отключёнными скриптами.
 *
 * Сначала оформление подсказывается браузеру через preload, чтобы очередь
 * загрузки не отодвинула его в конец.
 */
function nonBlockingStyles() {
  return {
    name: 'non-blocking-styles',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"([^>]*?)href="([^"]+)"([^>]*)>/g,
        (match, before, href, after) => {
          const rest = (before + after).replace(/\s*crossorigin\s*/g, ' ').trim()
          const attrs = rest ? ' ' + rest : ''
          return (
            `<link rel="preload" as="style" href="${href}"${attrs}>` +
            `<link rel="stylesheet" href="${href}"${attrs} media="print" onload="this.onload=null;this.media='all'">` +
            `<noscript><link rel="stylesheet" href="${href}"${attrs}></noscript>`
          )
        },
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), nonBlockingStyles()],
})
