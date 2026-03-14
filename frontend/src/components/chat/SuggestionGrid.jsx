import React from 'react';

const suggestions = [
  { label: "🔍 Search visas to Dubai", val: "Search visas to Dubai" },
  { label: "📄 What documents do I need?", val: "What documents do I need?" },
  { label: "📋 Check my application status", val: "Check my application status" },
  { label: "🌍 Show popular destinations", val: "Show popular destinations" }
];

const SuggestionGrid = ({ handleSend }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-10 px-6 overflow-y-auto">
      <span className="text-7xl mb-6">✈️</span>
      <h2 className="text-3xl font-serif font-black text-[#0A1628] mb-4 tracking-tight">Your OnchainCity Visa Advisor</h2>
      <p className="text-[#6B7280] font-medium mb-10 leading-relaxed">I'll help you search visas, navigate documents, and track your global applications in real-time.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {suggestions.map((s, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(s.val)}
            className="p-5 text-left border border-gray-100 rounded-2xl transition-all hover:bg-[#4F6EF7]/5 hover:border-[#4F6EF7]/20 group shadow-sm"
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
