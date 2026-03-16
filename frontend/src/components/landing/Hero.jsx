import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center pt-16 md:pt-20 pb-20 md:pb-32 px-4 md:px-6 min-h-[85vh] md:min-h-[90vh] overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-[#4F6EF7]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6 md:mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#6B7280]">Trusted by 50,000+ Travelers Worldwide</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-[#0A1628] leading-[1.1] mb-6 tracking-tight">
          Apply for Your Visa<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A1628] via-[#4F6EF7] to-[#0A1628]">Fast, Simple & Secure</span>
        </h1>

        <p className="text-base md:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium">
          Skip agents, avoid paperwork. Chat with our AI and get your visa processed in minutes. Truly borderless application experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16">
          <button 
            onClick={() => navigate('/chat')}
            className="pulse-btn w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full bg-[#0A1628] text-white text-base md:text-lg font-bold shadow-2xl shadow-[#0A1628]/40 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[56px]"
          >
            Get Started (2 min) <span className="text-xl md:text-2xl leading-none">→</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
           <p className="text-[11px] md:text-sm font-bold text-[#6B7280] flex flex-wrap justify-center items-center gap-2 md:gap-4">
             <span>200,000+ visas processed</span>
             <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300" />
             <span>Money-back guarantee</span>
           </p>
           
           <div className="flex flex-wrap justify-center gap-2 md:gap-3">
             {['SSL', 'Mastercard', 'Stripe', 'Visa'].map((badge) => (
               <span key={badge} className="px-3 md:px-4 py-1.5 rounded-full bg-white border border-gray-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                 {badge}
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* Floating Hero Icons (Emoji) - Hidden on mobile if too busy */}
      <div className="hidden sm:block absolute top-[20%] left-[10%] text-6xl animate-float opacity-20 pointer-events-none">✈️</div>
      <div className="hidden sm:block absolute top-[15%] right-[15%] text-6xl animate-float delay-700 opacity-20 pointer-events-none">🛂</div>
      <div className="hidden sm:block absolute bottom-[25%] left-[15%] text-6xl animate-float delay-1000 opacity-20 pointer-events-none">🏛️</div>
      <div className="hidden sm:block absolute bottom-[20%] right-[10%] text-6xl animate-float delay-500 opacity-20 pointer-events-none">🌎</div>
    </section>
  );
};

export default Hero;
