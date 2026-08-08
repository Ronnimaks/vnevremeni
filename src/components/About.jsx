import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-24 bg-[#0a0a0c] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-poet-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-10 leading-tight">
              Пространство, где слово <br className="hidden md:block"/> 
              <span className="text-poet-accent italic">встречается с музыкой</span>
            </h2>
            
            <div className="w-20 h-1 bg-poet-accent rounded mx-auto mb-10" />
            
            <div className="space-y-6 text-lg md:text-xl text-poet-light/90 leading-relaxed font-serif font-light">
              <p>
                Музыкально-поэтический клуб «Вне времени» — это место, где искренность становится главным критерием искусства.
              </p>
              <p>
                Здесь не гонятся за пафосом: здесь ценят живой голос, настоящую эмоцию и смелость выйти к микрофону — будь ты опытным автором или тем, кто впервые решается прочитать свои строки вслух. 
              </p>
              <p>
                В основе клуба — атмосфера творческого единения, где каждый голос важен, а каждая строчка может стать началом большой истории.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
