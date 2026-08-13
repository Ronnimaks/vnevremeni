import React, { useState } from 'react';
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
import Metrika from './components/Metrika';

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);

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

      <BookingModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <Metrika />
    </div>
  );
}

export default App;
