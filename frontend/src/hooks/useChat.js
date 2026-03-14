import { useState, useCallback, useEffect } from 'react';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL || ''}/api`;

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeToolCall, setActiveToolCall] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [applications, setApplications] = useState([]);
  const [visas, setVisas] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem('ocity_session_id') || null
  );

  // Fetch session on load
  useEffect(() => {
    const url = sessionId 
      ? `${BASE_URL}/agent/session?sessionId=${sessionId}`
      : `${BASE_URL}/agent/session`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.email) setUserEmail(data.email);
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('ocity_session_id', data.sessionId);
        }
      });
  }, [sessionId]);

  const sendMessage = useCallback(async (text, force = false) => {
    // 1. Immediately add user message
    if (isStreaming && !force) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = Date.now() + 1;
    let currentAssistantContent = '';

    try {
      const response = await fetch(`${BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let doneReading = false;
      let buffer = '';

      // Initialize assistant message
      setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '', visas: [], applications: [] }]);

      while (!doneReading) {
        const { value, done } = await reader.read();
        doneReading = done;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // Keep the last incomplete chunk

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.replace(/^data:\s*/, '').trim();
              if (!dataStr) continue;

              try {
                const event = JSON.parse(dataStr);

                if (event.type === 'session') {
                  setSessionId(event.sessionId);
                  localStorage.setItem('ocity_session_id', event.sessionId);
                } else if (event.type === 'text') {
                  currentAssistantContent += event.content;
                  setMessages((prev) =>
                    prev.map(m => m.id === assistantMsgId ? { ...m, content: currentAssistantContent } : m)
                  );

                  // OTP modal detection
                  const lowerContent = currentAssistantContent.toLowerCase();
                  if (lowerContent.includes("enter the otp") || lowerContent.includes("provide the code") || lowerContent.includes("otp code") || lowerContent.includes("verification code")) {
                    setShowOTP(true);
                  }

                } else if (event.type === 'tool_call') {
                  setActiveToolCall({ name: event.name, input: event.input });
                  if (event.name === 'send_otp') {
                    setShowOTP(true);
                    if (event.input?.email) setPendingEmail(event.input.email);
                  }
                } else if (event.type === 'tool_result') {
                  setActiveToolCall(null);

                  // parse result and optionally attach visas/apps
                  let parsedResult = null;
                  try {
                    parsedResult = JSON.parse(event.result);
                  } catch (e) { }

                  if (parsedResult) {
                    // Update global state based on tool name
                    if (event.name === 'search_visas' || event.name === 'get_featured_visas') {
                      const visaList = parsedResult.visas || (Array.isArray(parsedResult) ? parsedResult : []);
                      setVisas(visaList);
                      // Also attach to message for local component needs
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, visas: visaList } : m));
                    }

                    if (event.name === 'get_visa_details') {
                      setVisas([parsedResult]);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, visas: [parsedResult] } : m));
                    }

                    if (event.name === 'list_applications') {
                      const apps = parsedResult.applications || (Array.isArray(parsedResult) ? parsedResult : []);
                      setApplications(apps);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, applications: apps } : m));
                    }

                    if (event.name === 'submit_application') {
                      if (parsedResult.applicationId) {
                        const newApp = {
                          id: parsedResult.applicationId,
                          applicationId: parsedResult.applicationId,
                          visaId: parsedResult.visaId,
                          visaName: parsedResult.visaName || `Visa #${parsedResult.visaId}`,
                          status: parsedResult.status || 'pending',
                          submittedAt: parsedResult.submittedAt || new Date().toISOString()
                        };
                        setApplications(prev => [...prev, newApp]);
                        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, applications: [newApp] } : m));
                      }
                    }

                    if (event.name === 'verify_otp') {
                      if (parsedResult.success || parsedResult.token) {
                        const url = sessionId 
                          ? `${BASE_URL}/agent/session?sessionId=${sessionId}`
                          : `${BASE_URL}/agent/session`;
                        fetch(url)
                          .then(res => res.json())
                          .then(data => {
                            if (data.email) setUserEmail(data.email);
                          });
                      }
                    }
                  }
                } else if (event.type === 'error') {
                  console.error("Agent error:", event.message);
                  setMessages((prev) =>
                    prev.map(m => m.id === assistantMsgId ? { ...m, content: `Error: ${event.message}` } : m)
                  );
                  setIsStreaming(false);
                } else if (event.type === 'done') {
                  setIsStreaming(false);
                }
              } catch (err) {
                console.error("Failed to parse SSE event:", err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, sessionId]);

  const clearChat = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/agent/clear`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
      setMessages([]);
      setApplications([]);
      setVisas([]);
      setUserEmail(null);
      setSessionId(null);
      localStorage.removeItem('ocity_session_id');
    } catch (e) {
      console.error(e);
    }
  }, [sessionId]);

  return {
    messages,
    isStreaming,
    activeToolCall,
    sendMessage,
    clearChat,
    showOTP,
    setShowOTP,
    applications,
    visas,
    userEmail,
    pendingEmail,
    sessionId
  };
}
