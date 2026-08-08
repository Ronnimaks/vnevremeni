import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Users, X, LayoutDashboard } from 'lucide-react';

export default function AdminPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('events');

  const mockBookings = [
    { id: 1, name: "Иванов Иван", phone: "+7 (999) 111-22-33", event: "Вечер современной поэзии", status: "paid", tickets: 2 },
    { id: 2, name: "Мария С.", phone: "+7 (900) 222-33-44", event: "Открытый микрофон", status: "pending", tickets: 1 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] border border-white/10 rounded-xl shadow-2xl max-w-4xl w-full h-[80vh] relative z-10 overflow-hidden flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-poet-muted hover:text-white z-50">
          <X className="w-6 h-6" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#151518] border-r border-white/5 p-6 flex flex-col">
          <h2 className="text-xl font-serif font-bold text-white mb-8 flex items-center gap-2">
            <Settings className="w-5 h-5 text-poet-accent" />
            Админ-панель
          </h2>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${activeTab === 'events' ? 'bg-poet-accent/10 text-poet-accent' : 'text-poet-muted hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              События
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${activeTab === 'bookings' ? 'bg-poet-accent/10 text-poet-accent' : 'text-poet-muted hover:text-white hover:bg-white/5'}`}
            >
              <Users className="w-4 h-4" />
              Бронирования
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif text-white">Управление событиями</h3>
                <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
                  <Plus className="w-4 h-4" /> Добавить
                </button>
              </div>

              <div className="bg-[#151518] rounded-lg border border-white/5 p-6 mb-6">
                <h4 className="text-poet-light mb-4 text-sm font-medium uppercase tracking-wider">Новое событие</h4>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Название мероприятия" className="bg-black/30 border border-white/10 rounded px-4 py-2 text-white focus:border-poet-accent outline-none" />
                    <input type="text" placeholder="Дата и время" className="bg-black/30 border border-white/10 rounded px-4 py-2 text-white focus:border-poet-accent outline-none" />
                  </div>
                  <input type="number" placeholder="Цена билета (₽)" className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white focus:border-poet-accent outline-none" />
                  <textarea placeholder="Описание" rows={3} className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white focus:border-poet-accent outline-none resize-none" />
                  <button type="button" className="btn-outline w-full py-2">Сохранить</button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-2xl font-serif text-white mb-8">Списки гостей</h3>
              
              <div className="bg-[#151518] rounded-lg border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-poet-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Гость</th>
                      <th className="px-6 py-4">Событие</th>
                      <th className="px-6 py-4">Билеты</th>
                      <th className="px-6 py-4">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mockBookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium">{b.name}</div>
                          <div className="text-poet-muted text-xs">{b.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-poet-light/80">{b.event}</td>
                        <td className="px-6 py-4 text-sm text-poet-light/80">{b.tickets}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded border ${b.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                            {b.status === 'paid' ? 'Оплачено' : 'Ожидает'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
