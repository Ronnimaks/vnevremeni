import React from 'react';
import { motion } from 'framer-motion';

export default function Founder() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-poet-accent/5 rounded-full blur-[80px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
          
          {/* Text Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Кто стоит <span className="text-poet-accent italic">за клубом</span></h2>
              <div className="w-20 h-1 bg-poet-accent rounded mt-4 mb-8" />
            </div>
            
            <div className="space-y-6 text-poet-muted leading-relaxed">
              <p>
                Клуб основала <span className="text-white font-medium">Натали</span> — поэт и резидент «Вне времени». Именно её идея собрать вокруг себя тех, для кого слово — не просто текст, а способ говорить о важном, задала тон всему сообществу.
              </p>
              <p>
                Резиденты клуба — это не только поэты и вокалисты, но и продюсеры, сонграйтеры, авторы проектов: они не просто выступают, а формируют среду — помогают друг другу, пишут музыку на стихи, запускают лейблы и школы, продюсируют новые имена.
              </p>
            </div>
          </motion.div>
          
          {/* Photo Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 order-1 lg:order-2"
          >
            <div className="relative max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-4 border border-poet-accent/20 rounded-lg transform rotate-3 z-0" />
              
              <div className="bg-[#0a0a0c] border border-white/10 rounded-lg aspect-[3/4] w-full relative z-10 shadow-2xl group overflow-hidden">
                <img
                  src="./images/founder.webp"
                  alt="Натали — основатель клуба «Вне времени» на сцене"
                  width="768"
                  height="1024"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover [@media(hover:hover)]:grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              
              {/* Плашка с именем. На узком экране не свешивается влево:
                  выступ в 24 пикселя выводил её за край телефона. */}
              <div className="absolute -bottom-6 left-0 sm:-left-6 bg-poet-dark/90 backdrop-blur-md border border-poet-accent/30 p-4 rounded shadow-xl z-20">
                <h4 className="font-serif font-bold text-white text-lg">Натали</h4>
                <p className="text-poet-accent text-xs uppercase tracking-wider mt-1">Основатель, поэт и резидент</p>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
