const ChatHeader = ({ sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen }) => {
  return (
    <header className="h-16 md:h-20 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-3 md:p-2 hover:bg-black/5 rounded-xl transition-all flex items-center justify-center min-w-[44px] min-h-[44px] active:scale-90"
        >
          <span className="text-xl md:text-lg">☰</span>
        </button>
        <div className="flex flex-col">
           <span className="text-sm md:text-base font-black text-[#0A1628] leading-tight tracking-tight text-gradient">Visa Advisor</span>
           <span className="text-[9px] md:text-[10px] font-black text-[#10B981] flex items-center gap-1 leading-none uppercase tracking-widest">
             <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Service Active
           </span>
        </div>
      </div>
       <div className="flex items-center gap-2">
          <button 
           onClick={() => setRightPanelOpen(!rightPanelOpen)} 
           className={`p-3 md:p-2 hover:bg-[#4F6EF7]/10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-[#4F6EF7] px-4 md:px-5 min-w-[44px] min-h-[44px] transition-all flex items-center gap-2 ${rightPanelOpen ? 'bg-[#4F6EF7]/10' : 'bg-transparent'}`}
          >
            <span className="hidden md:inline">{rightPanelOpen ? 'Hide Tracker' : 'Show Tracker'}</span>
            <span className="md:hidden">📋</span>
          </button>
       </div>
    </header>
  );
};

export default ChatHeader;
