import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
// Файл лежит объектом с ключом residents, а не голым списком: этого требует
// личный кабинет — он умеет править только именованные поля файла.
import residentsData from '../data/residents.json';
import { SocialLinks } from './SocialIcons';

export default function Residents() {
  const [selectedResident, setSelectedResident] = useState(null);
  const residents = residentsData.residents || [];

  return (
    <section id="residents" className="py-24 bg-poet-dark relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Наши <span className="text-poet-accent italic">резиденты</span></h2>
          <p className="text-poet-muted text-lg max-w-2xl mx-auto">Душа и голос клуба. Те, кто создает атмосферу каждого вечера.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {residents.map((resident, index) => (
            <m.div
              key={resident.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer"
              onClick={() => setSelectedResident(resident)}
            >
              {/* Кадры сняты по-разному: где-то человек стоит выше, где-то ниже. Одна общая
                  точка обрезки одним срезала бы макушку, другим оставляла пустой потолок,
                  поэтому у каждого снимка своя — imageFocus в residents.json.
                  Обесцвечивание только там, где есть мышь: на сенсорном экране навести нечем,
                  и фото так и осталось бы серым. */}
              <img
                src={resident.image}
                alt={resident.name}
                style={{ objectPosition: `center ${resident.imageFocus || '30%'}` }}
                className="w-full h-full object-cover [@media(hover:hover)]:grayscale [@media(hover:hover)]:opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition duration-700 transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-poet-dark via-poet-dark/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <h4 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-poet-accent transition-colors">{resident.name}</h4>
                <p className="text-xs text-poet-accent leading-snug mb-2">{resident.role}</p>
                <p className="text-xs text-poet-light/70 uppercase tracking-widest flex items-center gap-2">
                  Подробнее <span className="text-poet-accent">→</span>
                </p>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      {/* Resident Modal */}
      <AnimatePresence>
        {selectedResident && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResident(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-poet-card border border-white/10 rounded-xl shadow-2xl max-w-4xl w-full relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedResident(null)}
                className="absolute top-4 right-4 text-white hover:text-poet-accent bg-black/50 p-2 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* На телефоне под фото отводилась полоса в 256 пикселей — от вертикального
                  портрета оставалась середина лица. Отдаём кадру нормальную высоту. */}
              <div className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto md:h-auto shrink-0 relative">
                <img
                  src={selectedResident.image}
                  alt={selectedResident.name}
                  style={{ objectPosition: `center ${selectedResident.imageFocus || '30%'}` }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-poet-card to-transparent md:hidden" />
              </div>

              <div className="w-full md:w-3/5 min-h-0 p-6 sm:p-8 md:p-10 overflow-y-auto">
                <h3 className="text-3xl font-serif font-bold text-white mb-2 pr-12">{selectedResident.name}</h3>
                <p className="text-sm text-poet-accent mb-4">{selectedResident.role}</p>
                <div className="w-12 h-1 bg-poet-accent rounded mb-6" />

                <p className="text-poet-light/90 leading-relaxed font-serif text-sm whitespace-pre-line">
                  {selectedResident.bio}
                </p>

                <SocialLinks links={selectedResident.socials} size="md" className="mt-8" />
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
