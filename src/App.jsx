import React, { Suspense, lazy, useState } from 'react';
import { LazyMotion } from 'framer-motion';
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
import Metrika from './components/Metrika';

// Окно бронирования — самая тяжёлая часть сайта, а видит его лишь тот, кто нажал
// «забронировать». Раньше оно ехало на телефон вместе с главной страницей и
// запускалось наравне с ней, отнимая время у того, что человек видит сразу.
// Теперь подгружается по нажатию — за долю секунды, на уже открытом сайте.
const BookingModal = lazy(() => import('./components/BookingModal'));

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    // Возможности анимаций подгружаются отдельно и следом за страницей, а не
    // вместе с ней. Строгий режим не даст случайно вернуть тяжёлый вариант:
    // если где-то останется старый <motion.*>, сборка сразу об этом скажет.
    <LazyMotion features={() => import('./lib/animacii').then((m) => m.default)} strict>
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

      {/* Пока окно не понадобилось, здесь нет ничего — ни разметки, ни кода. */}
      {selectedEvent && (
        <Suspense fallback={null}>
          <BookingModal
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        </Suspense>
      )}

      <Metrika />
    </div>
    </LazyMotion>
  );
}

export default App;
