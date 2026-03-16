const ChatHeader = ({ sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen }) => {
  return (
    <header className="h-16 md:h-20 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-3 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
        >
          <span className="text-xl md:text-lg">☰</span>
        </button>
        <div className="flex flex-col">
           <span className="text-xs md:text-sm font-bold text-[#0A1628] leading-tight">Visa AI Advisor</span>
           <span className="text-[9px] md:text-[10px] font-bold text-[#10B981] flex items-center gap-1 leading-none">
             <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Service Active
           </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button 
          onClick={() => setRightPanelOpen(!rightPanelOpen)} 
          className={`p-3 md:p-2 hover:bg-gray-100 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest text-[#4F6EF7] px-3 md:px-4 min-w-[40px] min-h-[40px] transition-all ${rightPanelOpen ? 'bg-indigo-50' : ''}`}
         >
           {rightPanelOpen ? 'Hide Tracker' : 'Show Tracker'}
         </button>
      </div>
    </header>
  );
};

export default ChatHeader;
