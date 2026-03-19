import React from 'react';

const ChatInput = ({ inputText, setInputText, handleSend, isStreaming }) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8 bg-transparent z-10 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white/40 backdrop-blur-2xl shadow-2xl rounded-full p-1.5 border border-white/40 focus-within:ring-4 focus-within:ring-[#4F6EF7]/10 transition-all duration-500">
          <div className="flex items-center">
            <button className="hidden sm:block p-3 text-gray-400 hover:text-[#4F6EF7] transition-all min-w-[48px] hover:scale-110 active:scale-90">📎</button>
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isStreaming}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold py-3 md:py-4 px-4 placeholder:text-[#6B7280]/30 resize-none max-h-32 min-h-[44px]"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isStreaming || !inputText.trim()}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A1628] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:scale-100 flex-shrink-0 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4F6EF7] to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10 text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]/40 text-center mt-4">Powered by OnchainCity Intelligence</p>
       </div>
    </div>
  );
};

export default ChatInput;
