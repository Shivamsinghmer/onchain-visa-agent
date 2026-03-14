import React from 'react';

const ChatHeader = ({ sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen }) => {
  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">☰</button>
        <div className="flex flex-col">
           <span className="text-sm font-bold text-[#0A1628]">Visa AI Advisor</span>
           <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1 leading-none">
             <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse"></span> Service Active
           </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-[#4F6EF7] px-3">
           {rightPanelOpen ? 'Hide Panel' : 'Show Panel'}
         </button>
      </div>
    </header>
  );
};

export default ChatHeader;
