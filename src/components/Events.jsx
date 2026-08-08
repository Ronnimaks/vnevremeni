import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: "Вечер современной поэзии: «Тени мегаполиса»",
    date: "15 Ноября, 2026",
    time: "19:00",
    location: "Арт-пространство «Люмьер»",
    description: "Чтения молодых авторов под аккомпанемент живой виолончели. Погружение в атмосферу ночного города.",
    price: "от 1500",
    image: "./images/event_1.jpg",
    ticketCategories: [
      { id: 'parterre', name: 'Партер', price: 1500 },
      { id: 'dress_circle', name: 'Бельэтаж', price: 2500 },
      { id: 'lodge', name: 'Ложа', price: 5000 }
    ]
  },
  {
    id: 2,
    title: "Открытый микрофон: «Слова без фильтров»",
    date: "22 Ноября, 2026",
    time: "20:00",
    location: "Бар «Вне времени»",
    description: "Сцена свободна для всех желающих. Приходи слушать или читать свое. Регистрация обязательна.",
    price: "от 800",
    image: "./images/event_2.webp",
    ticketCategories: [
      { id: 'standard', name: 'Входной билет', price: 800 },
      { id: 'table', name: 'Место за столиком', price: 1500 }
    ]
  },
  {
    id: 3,
    title: "Специальный гость: Моноспектакль",
    date: "5 Декабря, 2026",
    time: "18:30",
    location: "Камерный театр",
    description: "Синтез поэзии, света и звука. Эксклюзивная программа от резидентов клуба.",
    price: "от 2500",
    image: "./images/event_3.jpg",
    ticketCategories: [
      { id: 'parterre', name: 'Партер', price: 2500 },
      { id: 'vip', name: 'VIP-ложа', price: 7000 }
    ]
  }
];

export default function Events({ onBook }) {
  return (
    <section id="events" className="py-24 bg-poet-dark relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Ближайшие <span className="text-poet-accent italic">события</span></h2>
            <p className="text-poet-muted text-lg">Афиша наших встреч. Количество мест строго ограничено для сохранения камерной атмосферы.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card group flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 bg-poet-dark/80 backdrop-blur-md px-3 py-1 rounded text-poet-accent font-medium border border-poet-accent/20">
                  {event.price} ₽
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif font-bold text-white mb-4 group-hover:text-poet-accent transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-2 mb-6 text-sm text-poet-light/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-poet-accent" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-poet-accent" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-poet-accent" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <p className="text-poet-muted mb-8 flex-grow text-sm leading-relaxed">
                  {event.description}
                </p>
                
                <button 
                  onClick={() => onBook(event)}
                  className="w-full py-3 border border-white/10 hover:border-poet-accent text-white hover:text-poet-accent bg-white/5 hover:bg-poet-accent/10 transition-all rounded text-sm font-medium uppercase tracking-wider"
                >
                  Купить билет
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
