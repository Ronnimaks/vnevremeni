import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users } from 'lucide-react';

export default function Community() {
  return (
    <section className="py-24 bg-poet-dark relative overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Чем живёт <span className="text-poet-accent italic">сообщество</span></h2>
          <div className="w-20 h-1 bg-poet-accent rounded mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors group"
          >
            <Users className="w-8 h-8 text-poet-accent mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-bold text-white mb-4">Ценность пути</h3>
            <p className="text-poet-muted text-sm leading-relaxed">
              Многие резиденты начинали с открытого микрофона, а потом становились частью команды. Мы ценим не только готовое мастерство, но и сам путь автора.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 border border-poet-accent/20 bg-poet-accent/5 rounded-xl hover:bg-poet-accent/10 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-poet-accent/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
            <Sparkles className="w-8 h-8 text-poet-accent mb-6 group-hover:scale-110 transition-transform relative z-10" />
            <h3 className="text-xl font-serif font-bold text-white mb-4 relative z-10">Поддержка экспериментов</h3>
            <p className="text-poet-light/90 text-sm leading-relaxed relative z-10">
              Смешение жанров, неожиданные аранжировки, театральные интонации и визуальные элементы — мы приветствуем всё, что помогает автору раскрыться.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors group"
          >
            <Heart className="w-8 h-8 text-poet-accent mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-bold text-white mb-4">Человечность</h3>
            <p className="text-poet-muted text-sm leading-relaxed">
              Главное, что мы сохраняем. В каждом нашем вечере есть место для тёплых слов, искренних воспоминаний и благодарности тем, кто пришёл послушать.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
