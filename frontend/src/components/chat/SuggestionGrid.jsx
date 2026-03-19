import React from 'react';

const suggestions = [
  { label: "🔍 Search visas to Dubai", val: "Search visas to Dubai" },
  { label: "📄 What documents do I need?", val: "What documents do I need?" },
  { label: "📋 Check my application status", val: "Check my application status" },
  { label: "🌍 Show popular destinations", val: "Show popular destinations" },
  { label: "📶 Get eSIM for Japan", val: "I need an eSIM data plan for Japan" },
  { label: "📱 eSIM plans for Dubai", val: "Show me eSIM plans for Dubai" }
];

const SuggestionGrid = ({ handleSend }) => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8 md:py-12 px-6 overflow-y-auto">
      <span className="text-4xl sm:text-5xl md:text-6xl mb-4 md:mb-6 ">✈️</span>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-[#0A1628] mb-3 md:mb-4 tracking-tight leading-tight">Your OnchainCity Visa Advisor</h2>
      <p className="text-sm md:text-base text-[#6B7280] font-medium mb-8 md:mb-10 leading-relaxed max-w-md">I'll help you search visas, navigate documents, track applications, and get eSIM data plans for your travels.</p>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s.val)}
            className="p-4 md:p-5 text-left border border-gray-100 rounded-2xl transition-all hover:bg-[#4F6EF7]/5 hover:border-[#4F6EF7]/20 group shadow-sm min-h-[48px]"
          >
            <span className="text-sm font-bold text-[#0A1628] block group-hover:text-[#4F6EF7] transition-colors">{s.label}</span>
            <span className="text-[10px] text-[#6B7280] font-medium">Click to ask assistant</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionGrid;
