import React from 'react';
import Navbar from './landing/Navbar.jsx';
import Hero from './landing/Hero.jsx';
import Footer from './landing/Footer.jsx';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans text-[#1A1A2E] selection:bg-[#4F6EF7]/20">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;
