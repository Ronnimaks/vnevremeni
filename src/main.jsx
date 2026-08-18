import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// В index.html лежит текстовый блок для поисковиков и для медленной связи —
// без него в исходном коде страницы нет ни одного слова. Как только приложение
// запустилось, блок больше не нужен: тот же текст уже есть на самой странице.
document.getElementById('seo-fallback')?.remove()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
