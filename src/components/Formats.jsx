import React from 'react';
import { motion } from 'framer-motion';
import { Mic2, Music, Map, Star } from 'lucide-react';

const formats = [
  {
    title: "Открытые микрофоны",
    description: "Площадка для новых голосов: поэты и музыканты могут выступить, получить отклик и сделать первый шаг на сцену. Проводим особые форматы: «Золотой открытый микрофон» и тематические баттлы с призами.",
    icon: Mic2,
    image: "./images/review_1.jpg" // placeholders for now, maybe remove images and use icons
  },
  {
    title: "Резидентские вечера",
    description: "Выступления постоянных участников клуба, где поэзия и музыка сплетаются в единую программу: мелодекламации, авторские песни, каверы на стихи резидентов.",
    icon: Music,
    image: "./images/review_2.jpg"
  },
  {
    title: "Коллаборации и гастроли",
    description: "Сотрудничаем с другими творческими сообществами и устраиваем выездные мероприятия, расширяя поэтическую карту и объединяя авторов из разных городов.",
    icon: Map,
    image: "./images/review_3.jpg"
  },
  {
    title: "Спецпроекты и партнёрства",
    description: "Совместные вечера с брендами, участие в фестивалях, создание уникальных форматов, где поэзия становится частью крупных городских событий.",
    icon: Star,
    image: "./images/event_3.jpg"
  }
];

export default function Formats() {
  return (
    <section className="py-24 bg-poet-dark relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Что происходит <span className="text-poet-accent italic">в клубе?</span></h2>
          <p className="text-poet-muted text-lg max-w-2xl mx-auto">Форматы наших встреч — от первых шагов на сцене до больших гастролей.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {formats.map((format, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card flex flex-col md:flex-row h-full overflow-hidden group"
            >
              <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-poet-accent/20 mix-blend-multiply z-10 group-hover:bg-transparent transition-colors duration-500" />
                <img 
                  src={format.image} 
                  alt={format.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transform group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-6 md:p-8 w-full md:w-3/5 flex flex-col justify-center">
                <div className="w-10 h-10 rounded-full bg-poet-accent/10 flex items-center justify-center mb-4">
                  <format.icon className="w-5 h-5 text-poet-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-poet-accent transition-colors">
                  {format.title}
                </h3>
                <p className="text-poet-muted text-sm leading-relaxed">
                  {format.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
