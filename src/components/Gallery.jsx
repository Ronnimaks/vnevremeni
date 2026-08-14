import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const photos = [
  { file: 'evening_03', full: [1066, 1600], thumb: [534, 800], alt: 'Крупный план: девушка поёт у микрофона в тёплом свете' },
  { file: 'evening_04', full: [1600, 1102], thumb: [800, 552], alt: 'Общее фото участников вечера у баннера клуба' },
  { file: 'evening_05', full: [1600, 1066], thumb: [800, 534], alt: 'Певица с микрофоном на фоне огней сцены' },
  { file: 'evening_06', full: [1066, 1600], thumb: [534, 800], alt: 'Выступление у микрофона на фоне баннера «Поэзия — это что-то на вечном»' },
  { file: 'evening_07', full: [1600, 1066], thumb: [800, 534], alt: 'Зрители аплодируют выступающему' },
  { file: 'evening_08', full: [1066, 1600], thumb: [534, 800], alt: 'Выступление у микрофона, снятое сквозь световое кольцо' },
  { file: 'evening_09', full: [1600, 1250], thumb: [800, 624], alt: 'Молодой автор читает свои строки с листа у микрофона' },
  { file: 'evening_10', full: [1066, 1600], thumb: [534, 800], alt: 'Гости вечера за столиками слушают выступление' },
  { file: 'evening_11', full: [1600, 1066], thumb: [800, 534], alt: 'Участницы вечера на сцене после выступления' },
  { file: 'evening_12', full: [1066, 1600], thumb: [534, 800], alt: 'Выступающий с микрофоном на сцене' },
  { file: 'evening_13', full: [1600, 1066], thumb: [800, 534], alt: 'Зрители снимают выступление на телефон' },
  { file: 'evening_14', full: [1066, 1600], thumb: [534, 800], alt: 'Вокалистка на сцене в свете цветных прожекторов' },
  { file: 'evening_15', full: [1600, 1066], thumb: [800, 534], alt: 'Певица у микрофонной стойки на сцене' },
  { file: 'evening_16', full: [1066, 1600], thumb: [534, 800], alt: 'Объятия на сцене после выступления' },
  { file: 'evening_17', full: [1600, 1066], thumb: [800, 534], alt: 'Гостьи вечера перед началом программы' },
  { file: 'evening_18', full: [1066, 1600], thumb: [534, 800], alt: 'Аплодисменты за столиком в зале' },
  { file: 'evening_19', full: [1600, 1066], thumb: [800, 534], alt: 'Пара гостей за столиком в зале' },
  { file: 'evening_20', full: [1066, 1600], thumb: [534, 800], alt: 'Портрет гостьи вечера' },
  // Чёрно-белые кадры фотографа стоят в конце: витрина должна начинаться с цвета.
  { file: 'evening_01', full: [1600, 1066], thumb: [800, 534], alt: 'Общий план зала: сцена, гирлянды и полные столики во время выступления' },
  { file: 'evening_02', full: [1066, 1600], thumb: [534, 800], alt: 'Выступающая у микрофона на фоне экрана с логотипом клуба «Вне времени»' }
];

const INITIAL_COUNT = 10;

const VK_OID = 475890465;

const videos = [
  {
    id: '456239319',
    hash: '191d5d1ecfb2eb309f',
    title: 'Живое выступление у микрофона',
    link: 'https://vk.ru/video475890465_456239319?access_key=191d5d1ecfb2eb309f'
  },
  {
    id: '456239321',
    hash: '7e06bdc808f3519754',
    title: 'Атмосфера зала',
    link: 'https://vk.ru/video475890465_456239321?access_key=7e06bdc808f3519754'
  }
];

export default function Gallery() {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(null);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  const shown = expanded ? photos.length : Math.min(INITIAL_COUNT, photos.length);
  const visible = photos.slice(0, shown);
  const isOpen = current !== null;

  const close = useCallback(() => setCurrent(null), []);
  const go = useCallback((delta) => {
    setCurrent(prev => (prev === null ? prev : (prev + delta + shown) % shown));
  }, [shown]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close, go]);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
    else triggerRef.current?.focus();
  }, [isOpen]);

  const open = (index, event) => {
    triggerRef.current = event.currentTarget;
    setCurrent(index);
  };

  const photo = isOpen ? visible[current] : null;

  return (
    <section id="gallery" className="py-24 bg-[#0a0a0c]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Галерея <span className="text-poet-accent italic">вечеров</span></h2>
            <p className="text-poet-muted text-lg max-w-xl">Моменты, застывшие во времени. Атмосфера наших прошедших мероприятий в объективах фотографов.</p>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">Фотографии</h3>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {visible.map((item, index) => (
            <motion.button
              key={item.file}
              type="button"
              onClick={(e) => open(index, e)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              className="relative block w-full mb-4 overflow-hidden group break-inside-avoid cursor-zoom-in"
            >
              {/* Затемнение снимается наведением, поэтому на сенсорном экране его нет вовсе —
                  иначе вся галерея выглядела бы тусклой и выцветшей. */}
              <div className="absolute inset-0 [@media(hover:hover)]:bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <img
                src={`./images/gallery/${item.file}_thumb.webp`}
                alt={item.alt}
                width={item.thumb[0]}
                height={item.thumb[1]}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </motion.button>
          ))}
        </div>

        {!expanded && photos.length > INITIAL_COUNT && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setExpanded(true)} className="btn-outline">
              Показать все фотографии
            </button>
          </div>
        )}

        <div className="mt-24">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Видео с вечеров</h3>
          <p className="text-poet-muted mb-8 max-w-xl">Живые записи выступлений — так это звучит и выглядит вживую.</p>

          {/* Записи с вечеров идут в один столбец: вдвоём в ряд они получались
              мельче вертикальных отзывов, хотя показывают куда больше. */}
          <div className="grid grid-cols-1 gap-8 max-w-4xl">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-4"
              >
                <div className="relative w-full aspect-video overflow-hidden rounded bg-black">
                  <iframe
                    src={`https://vk.com/video_ext.php?oid=${VK_OID}&id=${video.id}&hash=${video.hash}`}
                    title={video.title}
                    loading="lazy"
                    allow="encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h4 className="text-lg font-serif font-bold text-white">{video.title}</h4>
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-poet-accent hover:text-white transition-colors border border-poet-accent/30 hover:border-poet-accent rounded px-3 py-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Смотреть во ВКонтакте
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {photo && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографии"
          >
            <div onClick={close} className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Закрыть просмотр"
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 text-poet-muted hover:text-white transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 text-poet-muted hover:text-poet-accent transition-colors"
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 text-poet-muted hover:text-poet-accent transition-colors"
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <motion.figure
              key={photo.file}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 max-w-5xl w-full flex flex-col items-center"
            >
              <img
                src={`./images/gallery/${photo.file}.webp`}
                alt={photo.alt}
                width={photo.full[0]}
                height={photo.full[1]}
                decoding="async"
                className="max-h-[78vh] w-auto h-auto max-w-full object-contain"
              />
              <figcaption className="mt-4 text-center text-sm text-poet-muted px-4">
                {photo.alt}
                <span className="block mt-1 text-poet-accent">{current + 1} / {shown}</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
