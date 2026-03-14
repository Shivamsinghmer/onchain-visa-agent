import React from 'react';

export function VisaCard({ visa, onAction }) {
  const getBadgeColor = (time) => {
    if (time.includes("14") || time.includes("30")) return "bg-warning/20 text-warning";
    if (time.includes("days") || time.includes("5")) return "bg-success/20 text-success";
    return "bg-accent/20 text-accent";
  };

  return (
    <div className="flex-shrink-0 w-64 bg-surface/50 border border-border p-4 rounded-xl flex flex-col space-y-3 shrink-0 mr-4 shrink-0 transition-transform hover:-translate-y-1">
      <div className="w-full flex justify-between items-start">
         <span className="text-2xl">🌍</span>
         <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(visa.time || '')}`}>
           {visa.time || "Varies"}
         </span>
      </div>
      <div>
         <h4 className="font-display font-semibold text-lg text-text">
           {visa.country} {visa.name && `— ${visa.name}`}
         </h4>
         <p className="text-muted text-sm mt-1">{visa.description || "Get your visa quickly and easily."}</p>
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
         <span className="font-mono text-accent font-bold">
           {visa.price && visa.price !== 0 && visa.price !== '0' ? `$${visa.price}` : '$?'}
         </span>
         <div className="space-x-2 flex">
           <button onClick={() => onAction(`Tell me more about visa ${visa.id}`)} className="text-xs bg-bg border border-border px-2 py-1 rounded text-text hover:bg-border transition">Details</button>
           <button onClick={() => onAction(`I want to apply for visa ${visa.id}`)} className="text-xs bg-accent text-white px-2 py-1 rounded hover:opacity-90 transition">Apply</button>
         </div>
      </div>
    </div>
  );
}
