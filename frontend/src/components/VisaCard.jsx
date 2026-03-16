import React from 'react';

export function VisaCard({ visa, onAction }) {
  const getBadgeColor = (time) => {
    if (!time) return "bg-blue-50 text-blue-600";
    const timeStr = String(time).toLowerCase();
    if (timeStr.includes("14") || timeStr.includes("30")) return "bg-orange-50 text-orange-600";
    if (timeStr.includes("days") || timeStr.includes("5")) return "bg-green-50 text-green-600";
    return "bg-indigo-50 text-indigo-600";
  };

  const countryName = (visa.country && typeof visa.country === 'object') ? visa.country.name : visa.country;
  const countryFlag = (visa.country && typeof visa.country === 'object') ? visa.country.flag : '🌍';
  const visaDisplayName = visa.visaName || visa.name || 'Visa';
  const processingTime = visa.processingTime || visa.time || "Varies";

  return (
    <div className="flex-shrink-0 w-[260px] md:w-[280px] bg-white border border-gray-100 p-5 rounded-2xl flex flex-col space-y-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="w-full flex justify-between items-start">
        <span className="text-3xl drop-shadow-sm">{countryFlag}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getBadgeColor(processingTime)}`}>
          {processingTime}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-serif font-black text-base md:text-lg text-[#0A1628] leading-tight">
          {countryName}<br />
          <span className="text-gray-400 text-sm font-medium">{visaDisplayName}</span>
        </h4>
        <p className="text-[#6B7280] text-xs font-medium mt-2 leading-relaxed line-clamp-2">{visa.description || "Simplifying your travel documentation."}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <span className="font-black text-[#4F6EF7] text-lg">
          {visa.price && visa.price !== 0 && visa.price !== '0' ? `$${visa.price}` : 'Free'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onAction(`Tell me more about visa ${visa.id}`)}
            className="h-10 px-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#0A1628] hover:bg-gray-100 transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onAction(`I want to apply for visa ${visa.id}`)}
            className="h-10 px-4 bg-[#0A1628] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0A1628]/20"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
