import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ messages, sidebarOpen, clearChat, applications, userEmail, setSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <aside className="h-full w-64 bg-[#F1F3FF] border-r border-gray-200 flex flex-col relative overflow-hidden">
      {/* Mobile Close Button */}
      <button 
        onClick={() => setSidebarOpen?.(false)}
        className="absolute top-4 right-4 lg:hidden p-2 text-[#6B7280] hover:text-[#0A1628] transition-all z-50 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg"
      >
        <span className="text-xl">✕</span>
      </button>

      <div className="p-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#0A1628] font-serif font-black text-xl mb-8 group"
        >
          <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span>
          <span>OnchainCity</span>
        </button>

        <button 
          onClick={clearChat}
          className="w-full h-12 px-4 rounded-xl bg-[#0A1628] text-white text-sm font-bold shadow-lg shadow-[#0A1628]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="text-lg">+</span> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4 px-2">Conversation History</p>
          <div className="space-y-1">
            {messages.length > 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A1628]/5 cursor-pointer group transition-colors">
                <span className="text-lg">💬</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">Current Visa Inquiry</p>
                  <p className="text-[10px] text-[#6B7280] font-medium">Just now</p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#6B7280] px-3 font-medium opacity-50">No recent history</p>
            )}
          </div>
        </div>

        {applications && applications.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4 px-2">Your Applications</p>
            <div className="space-y-2">
              {applications.map((app, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[#0A1628]/10 bg-white shadow-sm hover:border-[#4F6EF7]/30 transition-all">
                  <p className="text-[10px] font-black text-[#0A1628] truncate">{app.visaName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[8px] font-bold text-[#6B7280]">{app.applicationId || app.id}</span>
                    <span className="text-[8px] font-black uppercase text-[#4F6EF7] bg-[#4F6EF7]/5 px-1.5 py-0.5 rounded-full">{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 mt-auto bg-[#F1F3FF]">
        <div className="flex items-center gap-3 p-2">
          <div className={`w-10 h-10 shrink-0 rounded-full ${userEmail ? 'bg-[#10B981]' : 'bg-[#4F6EF7]'} flex items-center justify-center text-white font-bold shadow-md transition-colors`}>
            {userEmail ? userEmail[0].toUpperCase() : 'G'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">{userEmail || 'Guest Traveler'}</p>
            <p className={`text-[10px] font-medium truncate ${userEmail ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>
              {userEmail ? 'Verified Account' : 'Please verify email'}
            </p>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B7280] text-center mt-6">© 2025 OnchainCity</p>
      </div>
    </aside>
  );
};

export default ChatSidebar;
