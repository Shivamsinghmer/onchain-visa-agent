import React from 'react';
import { VisaCard } from './VisaCard.jsx';
import { ApplicationCard } from './ApplicationCard.jsx';

export function MessageBubble({ message, onQuickAction }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-4 md:mb-6 animate-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] md:max-w-[75%] p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col space-y-3 md:space-y-4 shadow-sm ${
        isUser 
          ? 'bg-[#4F6EF7] text-white rounded-br-none ml-auto' 
          : 'bg-[#F1F3FF] border border-indigo-50/50 text-[#1A1A2E] rounded-bl-none'
      }`}>
        {message.content && (
          <div className="whitespace-pre-wrap font-sans text-sm md:text-[15px] leading-relaxed break-words space-y-2">
            {message.content.split('\n').map((line, i) => {
               if (!line.trim()) return <div key={i} className="h-1 md:h-2" />;

               // Detect bullet points
               const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
               const cleanLine = isBullet ? line.trim().substring(2) : line;

               // Bold marker translation "**bold**"
               const formatted = cleanLine.split(/(\*\*.*?\*\*)/).map((part, j) => {
                 if (part.startsWith('**') && part.endsWith('**')) {
                   return <strong key={j} className="font-bold text-[#0A1628]">{part.slice(2, -2)}</strong>;
                 }
                 return part;
               });

               if (isBullet) {
                 return (
                   <div key={i} className="flex items-start gap-2 pl-2">
                     <span className="text-[#4F6EF7] mt-1.5 flex-shrink-0">•</span>
                     <span className="flex-1">{formatted}</span>
                   </div>
                 );
               }

               return <p key={i} className="mb-0">{formatted}</p>;
            })}
          </div>
        )}

        {message.visas && message.visas.length > 0 && (
          <div className="flex overflow-x-auto gap-4 pb-2 pt-2 scrollbar-hide w-full max-w-full snap-x">
            {message.visas.map((v, idx) => (
              <div key={idx} className="snap-center">
                <VisaCard visa={v} onAction={onQuickAction} />
              </div>
            ))}
          </div>
        )}

        {message.applications && message.applications.length > 0 && (
          <div className="mt-4 flex flex-col space-y-3">
            {message.applications.map((app, idx) => (
              <ApplicationCard key={idx} application={app} onAction={onQuickAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
