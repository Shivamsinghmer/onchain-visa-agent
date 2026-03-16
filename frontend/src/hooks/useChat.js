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
  const [submittedForms, setSubmittedForms] = useState(new Set());
  const [dismissedForms, setDismissedForms] = useState(new Set());

  const FIELD_TYPE_MAP = {
    "full name": { label: "Full Name", type: "text" },
    "date of birth": { label: "Date of Birth", type: "date" },
    "passport": { label: "Passport Number", type: "text", uppercase: true },
    "nationality": { label: "Your Nationality", type: "text" },
    "country": { label: "Destination Country", type: "text" },
    "visa type": { label: "Visa Category", type: "text" },
    "travel date": { label: "Travel Start Date", type: "date" },
    "return date": { label: "Return Date", type: "date" },
    "departure date": { label: "Departure Date", type: "date" },
    "check-in": { label: "Check-in Date", type: "date" },
    "check-out": { label: "Check-out Date", type: "date" },
    "purpose": { label: "Purpose of Visit", type: "text" },
    "phone number": { label: "Phone Number", type: "tel" },
    "address": { label: "Full Address", type: "text" },
    "accommodation": { label: "Accommodation Details", type: "text" },
    "number of guests": { label: "Number of Guests", type: "number" },
    "rooms": { label: "Number of Rooms", type: "number" },
    "adults": { label: "Number of Adults", type: "number" }
  };

  const extractFieldsFromContent = (content) => {
    if (!content) return null;
    const lower = content.toLowerCase();
    
    // Exclude confirmation/status messages
    if (
      lower.includes("yes/no") || 
      lower.includes("confirm to submit") || 
      lower.includes("confirm yes") ||
      lower.includes("reply yes") ||
      lower.includes("say yes") ||
      lower.includes("processing") || 
      lower.includes("success") ||
      lower.includes("completed")
    ) return null;

    const sections = content.split('\n\n');
    const detectedFields = [];
    const seenLabels = new Set();
    
    sections.forEach(section => {
      const sectionLower = section.toLowerCase();
      // Skip sections that list already provided information
      if (sectionLower.includes("already provided") || sectionLower.includes("you provided") || sectionLower.includes("received your")) {
        return;
      }

      const lines = section.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Detect bullet points or numbered lists
        if (/^[•\-\*\d\.\)\s]+/.test(trimmed)) {
          const lineText = trimmed.replace(/^[•\-\*\d\.\)\s]+/, '').trim();
          if (!lineText || lineText.length < 3) return;

          const lineLower = lineText.toLowerCase();

          // If a line contains a colon followed by a value (not just a label), it's a restatement
          // e.g. "Date of birth: 2006-11-03" -> skip
          if (lineText.includes(':')) {
            const parts = lineText.split(':');
            const valuePart = parts.slice(1).join(':').trim();
            if (valuePart.length > 0 && !valuePart.includes('YYYY') && !valuePart.includes('XXXX')) return;
          }

          const isRequestPrefix = /^(what|provide|enter|which|your|tell|input|please|departure|return|travel|date|passport|full name|nationality|purpose|accommodation|phone|address)/i.test(lineText);
          const hasQuestionMark = lineText.includes('?');
          const isKnownField = Object.keys(FIELD_TYPE_MAP).some(k => lineLower.includes(k));
          
          // Exclude lines that look like document checklists rather than data input
          const isChecklist = lineLower.includes("copy of") || lineLower.includes("page of") || lineLower.includes("photograph");
          
          if ((hasQuestionMark || isRequestPrefix || isKnownField) && !isChecklist) {
            const matchKey = Object.keys(FIELD_TYPE_MAP).find(k => lineLower.includes(k));
            let fieldToAdd = null;

            if (matchKey) {
              fieldToAdd = {
                originalLabel: lineText,
                label: FIELD_TYPE_MAP[matchKey].label,
                type: FIELD_TYPE_MAP[matchKey].type,
                uppercase: FIELD_TYPE_MAP[matchKey].uppercase || false
              };
            } else if (hasQuestionMark) {
              const labelStr = lineText.split('?')[0].trim();
              fieldToAdd = {
                originalLabel: lineText,
                label: labelStr.length > 30 ? labelStr.substring(0, 27) + "..." : labelStr,
                type: "text"
              };
            }

            if (fieldToAdd && !seenLabels.has(fieldToAdd.label)) {
              detectedFields.push(fieldToAdd);
              seenLabels.add(fieldToAdd.label);
            }
          }
        }
      });
    });

    if (detectedFields.length >= 2) return detectedFields;
    if (detectedFields.length === 1 && /date|passport number|visa type|full name|nationality/i.test(content.toLowerCase())) return detectedFields;
    return null;
  };

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
    
    // Auto-dismiss the latest form if user sends a message manually
    if (!force) {
      const lastAssistantForm = [...messages].reverse().find(m => m.role === 'assistant' && m.formFields);
      if (lastAssistantForm) {
        setDismissedForms(prev => new Set(prev).add(lastAssistantForm.id));
      }
    }

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
                      const visaList = parsedResult.data || parsedResult.visas || (Array.isArray(parsedResult) ? parsedResult : []);
                      setVisas(visaList);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, visas: visaList } : m));
                    }

                    if (event.name === 'get_visa_details') {
                      const visaData = parsedResult.data || parsedResult;
                      setVisas([visaData]);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, visas: [visaData] } : m));
                    }

                    if (event.name === 'list_applications') {
                      const apps = parsedResult.data || parsedResult.applications || (Array.isArray(parsedResult) ? parsedResult : []);
                      setApplications(apps);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, applications: apps } : m));
                    }

                    if (event.name === 'submit_application') {
                      const appData = parsedResult.data || parsedResult;
                      if (appData.applicationId || appData.id) {
                        const newApp = {
                          id: appData.applicationId || appData.id,
                          applicationId: appData.applicationId || appData.id,
                          visaId: appData.visaId || appData.visa_id,
                          visaName: appData.visaName || appData.visa_type || `Visa #${appData.visaId || appData.visa_id}`,
                          status: appData.status || 'pending',
                          submittedAt: appData.submittedAt || appData.created_at || new Date().toISOString()
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
                  setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      const fields = extractFieldsFromContent(lastMsg.content);
                      if (fields) {
                        return prev.map(m => m.id === lastMsg.id ? { ...m, formFields: fields } : m);
                      }
                    }
                    return prev;
                  });
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
    sessionId,
    submittedForms,
    setSubmittedForms,
    dismissedForms
  };
}
