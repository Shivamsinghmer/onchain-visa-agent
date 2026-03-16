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
  
  // Set initial states correctly to prevent "flash" of open sidebar on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [rightPanelOpen, setRightPanelOpen] = useState(window.innerWidth >= 1280);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const wideQuery = window.matchMedia('(min-width: 1280px)');

    const handleDesktopChange = (e) => {
      // Auto-open on desktop, auto-close on mobile
      setSidebarOpen(e.matches);
    };

    const handleWideChange = (e) => {
      setRightPanelOpen(e.matches);
    };

    // Register modern listeners
    desktopQuery.addEventListener('change', handleDesktopChange);
    wideQuery.addEventListener('change', handleWideChange);

    // Initial sync just in case
    setSidebarOpen(desktopQuery.matches);
    setRightPanelOpen(wideQuery.matches);

    return () => {
      desktopQuery.removeEventListener('change', handleDesktopChange);
      wideQuery.removeEventListener('change', handleWideChange);
    };
  }, []);

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
    
    // Auto-close sidebar on mobile after sending
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FF] font-sans text-[#1A1A2E] overflow-hidden relative">
      
      {/* Sidebar Overlay (Mobile/Tablet) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-all duration-300 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar Panel Container */}
      <div className={`fixed lg:relative z-[70] lg:z-0 h-full transition-all duration-300 ease-in-out w-64 flex-shrink-0 ${
        sidebarOpen 
          ? 'translate-x-0 visible' 
          : '-translate-x-full invisible lg:translate-x-0 lg:visible'
      }`}>
        <ChatSidebar 
          messages={messages} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          clearChat={clearChat} 
          applications={applications}
          userEmail={userEmail}
        />
      </div>

      <main className="flex-1 flex flex-col bg-white relative min-w-0 h-full z-0">
        <ChatHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          rightPanelOpen={rightPanelOpen} 
          setRightPanelOpen={setRightPanelOpen} 
        />

        <div className="flex-1 overflow-hidden flex flex-col relative w-full">
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto">
              <SuggestionGrid handleSend={handleSend} />
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              isStreaming={isStreaming} 
              activeToolCall={activeToolCall} 
              handleSend={handleSend} 
              messagesEndRef={messagesEndRef} 
            />
          )}
        </div>

        <ChatInput 
          inputText={inputText} 
          setInputText={setInputText} 
          handleSend={handleSend} 
          isStreaming={isStreaming} 
        />
      </main>

      {/* Right Panel Overlay (Small Screens) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] xl:hidden transition-all duration-300 ${
          rightPanelOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setRightPanelOpen(false)}
      />
      
      {/* Right Panel Container */}
      <div className={`fixed xl:relative z-[70] xl:z-0 right-0 h-full transition-all duration-300 ease-in-out w-80 flex-shrink-0 ${
        rightPanelOpen 
          ? 'translate-x-0 visible' 
          : 'translate-x-full invisible xl:translate-x-0 xl:visible'
      }`}>
        <RightPanel 
          rightPanelOpen={rightPanelOpen} 
          setRightPanelOpen={setRightPanelOpen}
          activeApplications={applications} 
          activeVisas={visas} 
        />
      </div>

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
