import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// В index.html лежит текстовый блок для поисковиков и для медленной связи —
// без него в исходном коде страницы нет ни одного слова.
//
// Убираем его только после того, как приложение действительно нарисовалось на
// экране. Раньше блок убирался до отрисовки, и между исчезновением текста и
// появлением сайта оставался зазор, в котором экран снова становился пустым.
// Два кадра подряд — надёжный способ дождаться настоящей отрисовки: первый
// ставит задачу в очередь, второй выполняется уже после того, как браузер
// показал результат.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('seo-fallback')?.remove()
  })
})
