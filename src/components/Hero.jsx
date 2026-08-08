import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-poet-dark/80 via-poet-dark/95 to-poet-dark z-10" />
        <img 
          src="./images/hero_bg.webp"
          alt="Зал во время поэтического вечера клуба «Вне времени»"
          className="w-full h-full object-cover opacity-40 grayscale"
        />
      </div>

      <div className="container mx-auto px-4 z-20 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-block px-4 py-1 border border-poet-accent/30 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-poet-accent text-sm font-medium tracking-widest uppercase">Музыкально-поэтический клуб</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
            Поэзия — это <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-poet-accent to-[#e6d0a7] italic">что-то на вечном</span>
          </h1>
          
          <p className="text-lg md:text-xl text-poet-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Камерные поэтические вечера, живая музыка и культурные события. Твои стихи вне критики и вне времени.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#events" className="btn-primary flex items-center justify-center gap-2">
              Ближайшее мероприятие
            </a>
            <a href="#about" className="btn-outline flex items-center justify-center">
              О клубе
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-poet-accent/10 rounded-full blur-[120px] pointer-events-none z-0" />
    </section>
  );
}
