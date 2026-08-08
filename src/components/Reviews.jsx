import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Натали Миронова",
    // ЗАГЛУШКА: личный Instagram Натальи нам неизвестен. Раньше здесь стояла ссылка
    // на аккаунт самого клуба — это неверно. Запросить у заказчицы и вписать сюда.
    instagram: null,
    instagramUrl: null,
    // ЗАГЛУШКА: прежняя цитата принадлежала заказчице и была про сайт, а не про клуб.
    // Текстовой расшифровки видеоотзыва у нас нет — запросить у заказчицы.
    quote: null,
    videoUrl: "./videos/natali_review.mp4",
    poster: "./videos/natali_review_poster.jpg"
  },
  {
    id: 2,
    // ЗАГЛУШКА: автор видеоотзыва от 8 августа не подписан. Имя, Instagram и текстовую
    // цитату запросить у заказчицы. Ничего не выдумывать — заменить эти три поля.
    name: "Имя уточняется",
    instagram: null,
    instagramUrl: null,
    quote: null,
    videoUrl: "./videos/guest_review.mp4",
    poster: "./videos/guest_review_poster.jpg"
  }
];

// Локальная иконка: в lucide-react брендовых иконок нет.
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const VideoReview = ({ review }) => (
  <div className="glass-card flex flex-col h-full relative overflow-hidden">
    <div className="relative aspect-[9/16] bg-black">
      <video
        src={review.videoUrl}
        poster={review.poster}
        className="w-full h-full object-contain"
        controls
        preload="metadata"
        playsInline
      />
    </div>

    <div className="p-6 flex flex-col flex-grow bg-poet-card/90">
      {review.quote && (
        <>
          <Quote className="w-6 h-6 text-poet-accent/30 mb-4" />
          <p className="text-poet-light/90 italic mb-6 flex-grow font-serif text-sm leading-relaxed">
            "{review.quote}"
          </p>
        </>
      )}

      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
        <div>
          <h5 className="font-medium text-white text-sm">{review.name}</h5>
          {review.instagramUrl && (
            <a
              href={review.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-poet-accent hover:text-white transition-colors mt-2"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tracking-wide">{review.instagram}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-poet-dark relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Отзывы <span className="text-poet-accent italic">гостей</span></h2>
          <p className="text-poet-muted text-lg max-w-2xl mx-auto">Живые эмоции наших резидентов и слушателей.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-3xl mx-auto justify-items-center">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full max-w-sm h-full"
            >
              <VideoReview review={review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
