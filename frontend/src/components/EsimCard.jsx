import React from 'react';

export function EsimCard({ esim, onAction }) {
  const dataDisplay = esim.dataUnlimited 
    ? 'Unlimited' 
    : esim.dataGB 
      ? `${esim.dataGB} GB` 
      : 'See details';

  const speedBadge = esim.dataSpeeds?.includes('5G') ? '5G' : '4G/LTE';
  
  const priceDisplay = esim.price && esim.price !== 0
    ? `${(esim.price / 100).toFixed(2)} ${esim.priceCurrency || 'USD'}`
    : 'See details';

  const getBrandIcon = () => {
    const brand = (esim.brandName || esim.brand || '').toLowerCase();
    if (brand.includes('airalo')) return '🌐';
    if (brand.includes('esim')) return '📱';
    return '📶';
  };

  return (
    <div className="flex-shrink-0 w-[260px] md:w-[280px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-5 rounded-2xl flex flex-col space-y-4 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border border-white/10">
      
      {/* Top: Brand + Speed Badge */}
      <div className="w-full flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getBrandIcon()}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#818CF8]">eSIM</p>
            <p className="text-xs font-bold text-white/80 truncate max-w-[140px]">
              {esim.brandName || esim.brand || 'Data Plan'}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
          {speedBadge}
        </span>
      </div>

      {/* Data + Duration */}
      <div className="flex-1 space-y-3">
        <div className="flex items-end gap-3">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Data</p>
            <p className="text-2xl font-black text-white leading-tight">{dataDisplay}</p>
          </div>
          {esim.durationDays && (
            <div className="pb-0.5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Duration</p>
              <p className="text-lg font-black text-white/90">{esim.durationDays} days</p>
            </div>
          )}
        </div>

        {/* Country/Regions */}
        {(esim.country || esim.regions) && (
          <div className="flex flex-wrap gap-1.5">
            {esim.country && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                {typeof esim.country === 'string' ? esim.country : '🌍'}
              </span>
            )}
            {esim.roaming && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                + Roaming
              </span>
            )}
          </div>
        )}
      </div>

      {/* Price + Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <span className="font-black text-[#818CF8] text-lg">
          {priceDisplay}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onAction(`Show me details for eSIM offer ${esim.offerId}`)}
            className="h-9 px-3 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-white/80 hover:bg-white/20 transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onAction(`I want to buy eSIM offer ${esim.offerId}`)}
            className="h-9 px-4 bg-[#818CF8] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#818CF8]/30"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
