import React from 'react';
import { VisaCard } from './VisaCard.jsx';
import { ApplicationCard } from './ApplicationCard.jsx';

export function MessageBubble({ message, onQuickAction }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 animate-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl flex flex-col space-y-4 shadow-sm ${
        isUser 
          ? 'bg-accent text-white rounded-br-none ml-auto' 
          : 'bg-surface border-l-4 border-accent2 text-text rounded-bl-none'
      }`}>
        {message.content && (
          <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed break-words space-y-2">
            {message.content.split('\n').map((line, i) => {
               if (!line.trim()) return <div key={i} className="h-2" />;

               // Detect bullet points
               const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
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
                     <span className="text-[#4F6EF7] mt-1.5">•</span>
                     <span className="flex-1">{formatted}</span>
                   </div>
                 );
               }

               return <p key={i} className="mb-0">{formatted}</p>;
            })}
          </div>
        )}

        {message.visas && message.visas.length > 0 && (
          <div className="flex overflow-x-auto pb-4 pt-2 scrollbar-hide w-full max-w-full">
            {message.visas.map((v, idx) => (
              <VisaCard key={idx} visa={v} onAction={onQuickAction} />
            ))}
          </div>
        )}

        {message.applications && message.applications.length > 0 && (
          <div className="mt-4 flex flex-col space-y-2">
            {message.applications.map((app, idx) => (
              <ApplicationCard key={idx} application={app} onAction={onQuickAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
