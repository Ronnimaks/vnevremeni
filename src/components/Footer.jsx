import React from 'react';
import { SocialLinks } from './SocialIcons';

const clubSocials = [
  { type: 'ig', url: 'https://www.instagram.com/vnevremeni2025' },
  { type: 'tg', url: 'https://t.me/vnevrem' },
  { type: 'vk', url: 'https://vk.ru/vnevrem2025' }
];

export default function Footer() {
  return (
    <footer id="contacts" className="bg-[#050505] pt-20 pb-10 border-t border-white/5 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold tracking-wider text-poet-light mb-6">ВНЕ ВРЕМЕНИ</h3>
            <p className="text-poet-muted text-sm max-w-sm leading-relaxed mb-6">
              Камерный музыкально-поэтический клуб. Открытые микрофоны, музыкальные вечера и культурные мероприятия для тех, кто ищет вдохновение.
            </p>
            <SocialLinks links={clubSocials} size="md" />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-wider text-sm">Навигация</h4>
            <ul className="space-y-3">
              <li><a href="#events" className="text-poet-muted hover:text-poet-accent transition-colors text-sm">Афиша</a></li>
              <li><a href="#about" className="text-poet-muted hover:text-poet-accent transition-colors text-sm">О клубе</a></li>
              <li><a href="#residents" className="text-poet-muted hover:text-poet-accent transition-colors text-sm">Резиденты</a></li>
              <li><a href="#gallery" className="text-poet-muted hover:text-poet-accent transition-colors text-sm">Галерея</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-wider text-sm">Сотрудничество</h4>
            <ul className="space-y-3">
              <li className="text-poet-muted text-sm flex flex-col gap-1">
                <span className="text-white/70 text-xs">Телефон</span>
                <a href="tel:+79161780458" className="hover:text-poet-accent transition-colors">+7 (916) 178-04-58</a>
              </li>
              <li className="text-poet-muted text-sm flex flex-col gap-1">
                <span className="text-white/70 text-xs">Telegram</span>
                <a href="https://t.me/vnevrem2025" target="_blank" rel="noopener noreferrer" className="hover:text-poet-accent transition-colors">@vnevrem2025</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-poet-muted/50 text-xs">
            © {new Date().getFullYear()} Музыкально-поэтический клуб «Вне времени». Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
