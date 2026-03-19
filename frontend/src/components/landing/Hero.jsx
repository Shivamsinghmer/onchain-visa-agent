import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center pt-16 md:pt-20 pb-20 md:pb-32 px-4 md:px-6 min-h-[85vh] md:min-h-[90vh] overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-[#4F6EF7]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-80 h-80 bg-[#818CF8]/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6 md:mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#6B7280]">Trusted by 50,000+ Travelers Worldwide</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-serif font-semibold text-[#0A1628] leading-[1.1] mb-6 tracking-tight">
          Visas & eSIM Data<br className="" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A1628] via-[#4F6EF7] to-[#818CF8]">All in One Place</span>
        </h1>

        <p className="text-base md:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium">
          Chat with our AI to get your visa processed in minutes, then grab an eSIM data plan for your destination — no paperwork, no roaming fees.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16">
          <button
            onClick={() => navigate('/chat')}
            className="pulse-btn w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-full bg-[#0A1628] text-white text-base md:text-lg font-bold shadow-2xl shadow-[#0A1628]/40 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[56px]"
          >
            Apply for Visa <span className="text-xl md:text-2xl leading-none">→</span>
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-full bg-white text-[#0A1628] text-base md:text-lg font-bold border-2 border-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:border-[#818CF8] hover:text-[#818CF8] active:scale-95 min-h-[56px] shadow-sm"
          >
            <span className="text-xl">📱</span> Get eSIM Plan
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="text-[11px] md:text-sm font-bold text-[#6B7280] flex flex-wrap justify-center items-center gap-2 md:gap-4">
            <span>200,000+ visas processed</span>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>eSIM in 100+ countries</span>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>Money-back guarantee</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {['SSL', 'Mastercard', 'Stripe', 'Visa', 'eSIM'].map((badge) => (
              <span key={badge} className={`px-3 md:px-4 py-1.5 rounded-full border text-[9px] md:text-[10px] font-semibold uppercase tracking-widest shadow-sm ${
                badge === 'eSIM' 
                  ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                  : 'bg-white border-gray-100 text-gray-400'
              }`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Hero Icons (Emoji) - Hidden on mobile if too busy */}
      <div className="hidden sm:block absolute top-[20%] left-[10%] text-6xl animate-float opacity-20 pointer-events-none">✈️</div>
      <div className="hidden sm:block absolute top-[15%] right-[15%] text-6xl animate-float delay-700 opacity-20 pointer-events-none">🛂</div>
      <div className="hidden sm:block absolute bottom-[25%] left-[15%] text-6xl animate-float delay-1000 opacity-20 pointer-events-none">📱</div>
      <div className="hidden sm:block absolute bottom-[20%] right-[10%] text-6xl animate-float delay-500 opacity-20 pointer-events-none">🌎</div>
    </section>
  );
};

export default Hero;
