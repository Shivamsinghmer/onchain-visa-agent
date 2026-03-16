const MessageList = ({ messages, isStreaming, activeToolCall, handleSend, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 scroll-smooth">
      {messages.map((m, idx) => (
        <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
          {m.role === 'assistant' && (
            <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] ml-2 md:ml-4 mb-2">OnchainCity AI</span>
          )}
          <div className={`max-w-[88%] md:max-w-[75%] p-4 md:p-5 rounded-2xl md:rounded-3xl text-sm md:text-[15px] font-medium leading-relaxed shadow-sm ${
            m.role === 'user' 
              ? 'bg-[#4F6EF7] text-white rounded-br-none' 
              : 'bg-[#F1F3FF] text-[#1A1A2E] rounded-bl-none border border-indigo-50/50'
          }`}>
            <div className="space-y-2 md:space-y-3">
              {m.content.split('\n').filter(l => l.trim()).map((line, i) => {
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
                const cleanLine = isBullet ? line.trim().replace(/^[•\-\*]\s*/, '') : line;

                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                const formattedLine = parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-black text-[#0A1628]">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });

                return (
                  <div key={i} className={`flex items-start gap-2 ${isBullet ? 'pl-2' : ''}`}>
                    {isBullet && <span className="text-[#4F6EF7] mt-1.5 flex-shrink-0">•</span>}
                    <p className="flex-1 m-0">{formattedLine}</p>
                  </div>
                );
              })}
            </div>
            
            {m.visas && m.visas.length > 0 && (
              <div className="flex overflow-x-auto gap-4 mt-6 pb-2 -mx-2 scrollbar-hide snap-x">
                {m.visas.map((v, i) => (
                  <div key={i} className="snap-center">
                    <VisaCard visa={v} onAction={handleSend} />
                  </div>
                ))}
              </div>
            )}

            {m.applications && m.applications.length > 0 && (
              <div className="flex flex-col gap-3 mt-6">
                {m.applications.map((app, i) => (
                  <ApplicationCard key={i} application={app} onAction={handleSend} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isStreaming && (
        <div className="flex flex-col items-start animate-fade-in">
           <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] ml-2 md:ml-4 mb-2">Advisor Thinking</span>
           <div className="bg-[#F1F3FF] p-4 md:p-5 rounded-2xl md:rounded-3xl rounded-bl-none inline-flex gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-[#4F6EF7]/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#4F6EF7]/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#4F6EF7]/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
           </div>
        </div>
      )}
      
      {activeToolCall && (
        <div className="flex items-center gap-2 ml-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#4F6EF7] animate-pulse">
          <span>⚙️ Calling {activeToolCall.name}...</span>
        </div>
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default MessageList;
