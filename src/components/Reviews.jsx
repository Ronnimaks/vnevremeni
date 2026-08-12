import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

// Ссылки на соцсети под отзывами пока не показываем: Instagram есть только
// у Натальи, и одна ссылка на двоих смотрелась бы странно. Вернём, когда
// заказчица пришлёт аккаунт Ильи.
const reviews = [
  {
    id: 1,
    name: "Наталья Миронова",
    role: "вокалистка, резидент клуба",
    videoUrl: "./videos/natali_review.mp4",
    poster: "./videos/natali_review_poster.jpg"
  },
  {
    id: 2,
    name: "Илья Садыгов",
    role: "гость вечеров и участник открытых микрофонов",
    videoUrl: "./videos/guest_review.mp4",
    poster: "./videos/guest_review_poster.jpg"
  }
];

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
      <Quote className="w-6 h-6 text-poet-accent/30 mb-4" />
      <div className="mt-auto">
        <h5 className="font-medium text-white text-sm">{review.name}</h5>
        <p className="text-poet-accent text-xs leading-snug mt-1">{review.role}</p>
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
