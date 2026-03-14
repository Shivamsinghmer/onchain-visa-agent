import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center pt-20 pb-32 px-4 min-h-[90vh] overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#4F6EF7]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Trusted by 50,000+ Travelers Worldwide</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#0A1628] leading-[1.1] mb-6 tracking-tight">
          Apply for Your Visa<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A1628] via-[#4F6EF7] to-[#0A1628]">Fast, Simple & Secure</span>
        </h1>

        <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Skip agents, avoid paperwork. Chat with our AI and get your visa processed in minutes. Truly borderless application experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            onClick={() => navigate('/chat')}
            className="pulse-btn w-full sm:w-auto px-10 py-5 rounded-full bg-[#0A1628] text-white text-lg font-bold shadow-2xl shadow-[#0A1628]/40 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Get Started (2 min) <span className="text-2xl leading-none">→</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
           <p className="text-sm font-bold text-[#6B7280] flex items-center gap-4">
             <span>200,000+ visas processed</span>
             <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
             <span>Money-back guarantee</span>
           </p>
           
           <div className="flex flex-wrap justify-center gap-3">
             {['SSL', 'Mastercard', 'Norton', 'Stripe', 'Visa', 'IATA'].map((badge) => (
               <span key={badge} className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                 {badge}
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* Floating Hero Icons (Emoji) */}
      <div className="absolute top-[20%] left-[10%] text-6xl animate-float opacity-20 pointer-events-none">✈️</div>
      <div className="absolute top-[15%] right-[15%] text-6xl animate-float delay-700 opacity-20 pointer-events-none">🛂</div>
      <div className="absolute bottom-[25%] left-[15%] text-6xl animate-float delay-1000 opacity-20 pointer-events-none">🏛️</div>
      <div className="absolute bottom-[20%] right-[10%] text-6xl animate-float delay-500 opacity-20 pointer-events-none">🌎</div>
    </section>
  );
};

export default Hero;
