const RightPanel = ({ rightPanelOpen, activeApplications, activeVisas, setRightPanelOpen }) => {
  return (
    <aside className="h-full w-80 bg-white border-l border-gray-100 flex flex-col overflow-hidden shrink-0 relative">
      {/* Mobile Close Button */}
      <button 
        onClick={() => setRightPanelOpen?.(false)}
        className="absolute top-4 left-4 xl:hidden p-2 text-[#6B7280] hover:text-[#0A1628] transition-all z-50 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-lg"
      >
        <span className="text-xl">✕</span>
      </button>

      <div className="p-6 md:p-8 overflow-y-auto space-y-8 md:space-y-10">
        
        <div className="pt-2 flex flex-col items-center text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F1F3FF] flex items-center justify-center text-3xl md:text-4xl mb-4 border border-indigo-50 shadow-inner">
             🌍
          </div>
          <h3 className="text-base md:text-lg font-serif font-black text-[#0A1628]">Global Travel Hub</h3>
          <p className="text-[10px] md:text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mt-1">Real-time Visa Intelligence</p>
        </div>

        {/* TRACKER */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1628]">Active Applications</h4>
            <span className="bg-indigo-50 text-[#4F6EF7] text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-100">
              {activeApplications.length}
            </span>
          </div>
          {activeApplications.length > 0 ? (
            <div className="space-y-3">
              {activeApplications.map((app, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F8F9FF] border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-black text-[#0A1628] truncate max-w-[120px]">{app.visaName}</p>
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                       app.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                     }`}>
                       {typeof app.status === 'string' ? app.status : 'Processing'}
                     </span>
                  </div>
                  <p className="text-[10px] font-bold text-[#6B7280]">
                    ID: {typeof app.applicationId === 'object' ? JSON.stringify(app.applicationId) : (app.applicationId || app.id)} • {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
               <span className="text-2xl mb-2 opacity-20">📂</span>
               <p className="text-[11px] font-bold text-[#6B7280] leading-tight max-w-[120px]">Start an application to track it here</p>
            </div>
          )}
        </div>

        {/* DOCUMENTS CHECKLIST */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1628] mb-6">Requirements Checklist</h4>
          <div className="p-6 rounded-3xl bg-[#0A1628]/5 border border-indigo-50/50 text-center flex flex-col items-center">
             {activeVisas.length > 0 ? (
                <div className="text-left w-full space-y-3">
                  <p className="text-[10px] font-black text-[#4F6EF7] mb-2 uppercase tracking-wide">
                    DOCUMENTS NEEDED FOR {(activeVisas[0].country && typeof activeVisas[0].country === 'object' ? activeVisas[0].country.name : activeVisas[0].country) || activeVisas[0].destination || 'Selected Destination'}:
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A2E]">
                     <span className="flex-shrink-0 w-3 h-3 rounded bg-white border border-gray-200"></span> Valid Passport
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A2E]">
                     <span className="flex-shrink-0 w-3 h-3 rounded bg-white border border-gray-200"></span> Digital Photo
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A2E]">
                     <span className="flex-shrink-0 w-3 h-3 rounded bg-white border border-gray-200"></span> Flight Tickets
                  </div>
                </div>
             ) : (
                <>
                  <span className="text-2xl mb-2 opacity-20">📄</span>
                  <p className="text-[11px] font-bold text-[#6B7280] leading-tight max-w-[120px]">Ask about a visa to see its documents</p>
                </>
             )}
          </div>
        </div>

        {/* HELP CENTER LINKS */}
        <div className="space-y-2 pt-4">
           {['Visa Policy Guide', 'Secure Document Center'].map(link => (
             <button key={link} className="w-full text-left px-5 py-3.5 rounded-2xl border border-gray-100 text-[9px] font-black uppercase tracking-[0.15em] text-[#6B7280] hover:bg-[#F8F9FF] hover:border-[#4F6EF7]/20 transition-all flex justify-between items-center group shadow-sm">
               {link}
               <span className="text-gray-300 group-hover:text-[#4F6EF7] transition-colors leading-none mb-1">→</span>
             </button>
           ))}
        </div>

      </div>
    </aside>
  );
};

export default RightPanel;
