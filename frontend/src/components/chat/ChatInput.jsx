import React from 'react';

const ChatInput = ({ inputText, setInputText, handleSend, isStreaming }) => {
  return (
    <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative flex items-center bg-white border-2 border-gray-100 rounded-2xl md:rounded-3xl p-1 shadow-2xl shadow-gray-200/50 focus-within:border-[#4F6EF7] transition-all">
          <button className="hidden sm:block p-4 text-gray-400 hover:text-[#4F6EF7] transition-all min-w-[44px]">📎</button>
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
            placeholder="Ask anything about visas..."
            className="flex-1 bg-transparent border-none outline-none text-base md:text-sm font-bold py-3 md:py-4 px-3 placeholder:text-[#6B7280]/40 resize-none max-h-32 min-h-[44px]"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isStreaming || !inputText.trim()}
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#0A1628] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100 flex-shrink-0"
          >
            <span className="text-xl">→</span>
          </button>
        </div>
       </div>
    </div>
  );
};

export default ChatInput;
