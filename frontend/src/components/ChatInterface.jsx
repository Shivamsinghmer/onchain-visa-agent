import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.js';
import ChatSidebar from './chat/ChatSidebar.jsx';
import ChatHeader from './chat/ChatHeader.jsx';
import MessageList from './chat/MessageList.jsx';
import ChatInput from './chat/ChatInput.jsx';
import RightPanel from './chat/RightPanel.jsx';
import SuggestionGrid from './chat/SuggestionGrid.jsx';
import OTPModal from './chat/OTPModal.jsx';

const ChatInterface = () => {
  const { 
    messages, 
    isStreaming, 
    activeToolCall, 
    sendMessage, 
    clearChat,
    applications,
    visas,
    userEmail,
    showOTP,
    setShowOTP,
    pendingEmail
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, activeToolCall]);

  const handleSend = (text, force = false) => {
    const msg = text || inputText;
    if (!msg.trim()) return;
    if (isStreaming && !force) return;
    
    sendMessage(msg, force);
    if (!text) setInputText('');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FF] font-sans text-[#1A1A2E] overflow-hidden">
      
      <ChatSidebar 
        messages={messages} 
        sidebarOpen={sidebarOpen} 
        clearChat={clearChat} 
        applications={applications}
        userEmail={userEmail}
      />

      <main className="flex-1 flex flex-col bg-white relative">
        <ChatHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          rightPanelOpen={rightPanelOpen} 
          setRightPanelOpen={setRightPanelOpen} 
        />

        {messages.length === 0 ? (
          <SuggestionGrid handleSend={handleSend} />
        ) : (
          <MessageList 
            messages={messages} 
            isStreaming={isStreaming} 
            activeToolCall={activeToolCall} 
            handleSend={handleSend} 
            messagesEndRef={messagesEndRef} 
          />
        )}

        <ChatInput 
          inputText={inputText} 
          setInputText={setInputText} 
          handleSend={handleSend} 
          isStreaming={isStreaming} 
        />
      </main>

      <RightPanel 
        rightPanelOpen={rightPanelOpen} 
        activeApplications={applications} 
        activeVisas={visas} 
      />

      <OTPModal 
        isOpen={showOTP} 
        onClose={() => setShowOTP(false)} 
        onSubmit={(code) => {
          handleSend(code, true);
          setShowOTP(false);
        }}
        email={pendingEmail || "your email"}
      />

    </div>
  );
};

export default ChatInterface;
