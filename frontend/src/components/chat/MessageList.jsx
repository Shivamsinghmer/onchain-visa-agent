import React from 'react';
import { VisaCard } from '../VisaCard.jsx';
import { ApplicationCard } from '../ApplicationCard.jsx';
import { EsimCard } from '../EsimCard.jsx';
import StructuredInputForm from './StructuredInputForm.jsx';

const MessageList = ({ messages, isStreaming, activeToolCall, handleSend, messagesEndRef, submittedForms, setSubmittedForms, dismissedForms }) => {
  const lastFormMsgId = [...messages].reverse().find(m => m.role === 'assistant' && m.formFields)?.id;
  
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-40 md:pb-56 space-y-8 scroll-smooth scrollbar-hide">
      {messages.map((m, idx) => (
        <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
          {m.role === 'assistant' && (
            <div className="flex items-center gap-2 ml-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#0A1628] flex items-center justify-center text-[10px] text-white font-black">O</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1628]/50">OnchainCity AI</span>
            </div>
          )}
          <div className={`max-w-[90%] md:max-w-[80%] p-5 md:p-7 rounded-[2rem] md:rounded-[2.5rem] text-[15px] md:text-base font-medium leading-[1.6] shadow-premium transition-all hover:shadow-2xl ${
            m.role === 'user' 
              ? 'bg-gradient-to-br from-[#0A1628] to-[#1A1A2E] text-white rounded-tr-none' 
              : 'glass text-[#1A1A2E] rounded-tl-none'
          }`}>
            <div className="space-y-4">
              {m.content.split('\n').filter(l => l.trim()).map((line, i) => {
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
                const cleanLine = isBullet ? line.trim().replace(/^[•\-\*]\s*/, '') : line;

                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                const formattedLine = parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-black text-[#0A1628] bg-[#4F6EF7]/5 px-1.5 py-0.5 rounded-md">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });

                return (
                  <div key={i} className={`flex items-start gap-4 ${isBullet ? 'pl-4' : ''}`}>
                    {isBullet && <div className="w-1.5 h-1.5 rounded-full bg-[#4F6EF7] mt-[10px] flex-shrink-0"></div>}
                    <p className="flex-1 m-0">{formattedLine}</p>
                  </div>
                );
              })}
            </div>
            
            {m.visas && m.visas.length > 0 && (
              <div className="flex overflow-x-auto gap-6 mt-8 pb-4 -mx-4 scrollbar-hide snap-x">
                {m.visas.map((v, i) => (
                  <div key={i} className="snap-center transform hover:scale-[1.02] transition-transform duration-500">
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

            {m.esimOffers && m.esimOffers.length > 0 && (
              <div className="flex overflow-x-auto gap-6 mt-8 pb-4 -mx-4 scrollbar-hide snap-x">
                {m.esimOffers.map((esim, i) => (
                  <div key={i} className="snap-center transform hover:scale-[1.02] transition-transform duration-500">
                    <EsimCard esim={esim} onAction={handleSend} />
                  </div>
                ))}
              </div>
            )}

            {m.formFields && !dismissedForms.has(m.id) && (
              <div className="mt-4">
                <StructuredInputForm
                  fields={m.formFields}
                  isSubmitted={submittedForms.has(m.id)}
                  onSubmit={(data) => {
                    if (m.id === lastFormMsgId && !submittedForms.has(m.id)) {
                      const formattedMsg = Object.entries(data)
                        .map(([label, value]) => `${label}: ${value}`)
                        .join(', ');
                      
                      handleSend(formattedMsg, true);
                      
                      const newSet = new Set(submittedForms);
                      newSet.add(m.id);
                      setSubmittedForms(newSet);
                    }
                  }}
                  disabled={m.id !== lastFormMsgId}
                />
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
