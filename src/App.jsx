import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Formats from './components/Formats';
import Events from './components/Events';
import Founder from './components/Founder';
import Residents from './components/Residents';
import Community from './components/Community';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';
import { Settings } from 'lucide-react';

// Панель админки — только по явному признаку в адресе (?admin или #admin).
// Это сокрытие от случайного посетителя, а не защита: бэкенда нет, признак виден в URL.
const hasAdminFlag = () =>
  new URLSearchParams(window.location.search).has('admin') ||
  window.location.hash === '#admin';

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(hasAdminFlag);

  useEffect(() => {
    const sync = () => setIsAdminVisible(hasAdminFlag());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <div className="bg-poet-dark min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Formats />
      <Events onBook={(event) => setSelectedEvent(event)} />
      <Founder />
      <Residents />
      <Community />
      <Gallery />
      <Reviews />
      <Footer />

      {/* Modals */}
      <BookingModal 
        event={selectedEvent} 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
      {isAdminVisible && (
        <>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />

          {/* Floating Admin Button for Demo */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="fixed bottom-6 right-6 w-12 h-12 bg-poet-accent text-poet-dark rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 group"
            title="Открыть демо админки"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </>
      )}
    </div>
  );
}

export default App;
