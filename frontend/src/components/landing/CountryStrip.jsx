import React from 'react';

const countries = [
  { name: 'Dubai', flag: '🇦🇪' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Germany', flag: '🇩🇪' },
];

const CountryStrip = () => {
  return (
    <div className="w-full bg-white py-8 border-y border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400 text-center mb-6">Visa & eSIM Destinations</p>
        <div className="flex overflow-x-auto gap-8 md:gap-12 pb-2 scrollbar-hide px-4 justify-start md:justify-center no-wrap">
          {countries.map((c, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0 group cursor-pointer transition-all hover:scale-105">
              <span className="text-3xl md:text-4xl grayscale group-hover:grayscale-0 transition-all">{c.flag}</span>
              <span className="text-xs md:text-sm font-bold text-[#6B7280] group-hover:text-[#0A1628] transition-colors whitespace-nowrap">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountryStrip;
