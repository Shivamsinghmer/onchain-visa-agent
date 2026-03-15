import Groq from 'groq-sdk';
import { getMcpToolsForGroq, callMcpTool } from './mcpClient.js';
import { getHistory, appendMessage, getEmail, setEmail, getState, setState } from './sessionStore.js';
import { SYSTEM_PROMPT } from './prompts.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function* runAgentStream(userMessage, sessionId) {
  try {
    console.log(`[Agent] runAgentStream called with message: "${userMessage}", session: ${sessionId}`);
    
    // 1. Append user message to session history
    appendMessage(sessionId, { role: 'user', content: userMessage });
    
    // 2. Fetch tools from MCP
    console.log(`[Agent] Fetching MCP tools...`);
    let tools;
    try {
      tools = await getMcpToolsForGroq();
      console.log(`[Agent] Got ${tools.length} tools from MCP`);
    } catch (err) {
      console.error(`[Agent] Failed to get MCP tools:`, err);
      tools = [];
    }

    let isLooping = true;
    let loopCount = 0;
    const MAX_LOOPS = 10;
    
    while (isLooping && loopCount < MAX_LOOPS) {
      loopCount++;
      console.log(`[Agent] Loop iteration #${loopCount}`);
      
      const history = getHistory(sessionId);
      const email = getEmail(sessionId);
      const pendingEmail = getState(sessionId, 'pendingEmail');
      const isFallback = getState(sessionId, 'isFallback');
      
      console.log(`[Agent] Session: ${sessionId}, Email: ${email}, Pending: ${pendingEmail}`);

      let contextMessage = '';
      if (email) {
        contextMessage = `Current User: **${email}** (Authenticated). You already have the user's email verified.`;
      } else if (pendingEmail) {
        contextMessage = `AUTHENTICATION STATUS: Email provided is **${pendingEmail}**. CODE SENT.
CRITICAL: The user's next message contains the 6-digit OTP code for **${pendingEmail}**.
1. Call verify_otp(email: "${pendingEmail}", code: "USER_DIGITS") immediately.
2. DO NOT validate the 6-digit number as an email address.
3. DO NOT ask for the email again. The email is **${pendingEmail}**.`;
      } else {
        contextMessage = `User is not yet authenticated. You MUST ask for their email address first. When they provide it, call send_otp(email).`;
      }

      if (isFallback) {
        contextMessage += ` [SYSTEM NOTE: Fallback Mode is active. The user verified using a local mock code because the staging server was unreachable. Real API calls requiring authentication may still fail with 401/Unauthorized. If this happens, do NOT ask the user to verify their email again; instead, explain that the staging server is currently limited or unreachable.]`;
      }

      const contextPrompt = { role: 'system', content: contextMessage };
      const messages = [SYSTEM_PROMPT, contextPrompt, ...history];

      // 3. Call Groq
      console.log(`[Agent] Calling Groq with ${messages.length} messages and model llama-3.3-70b-versatile`);

      let stream;
      try {
        stream = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? 'auto' : undefined,
          stream: true
        });
        console.log(`[Agent] Groq stream created successfully`);
      } catch (err) {
        console.error('[Agent] Groq.create failed:', err);
        yield { type: 'error', message: `AI service error: ${err.message}` };
        return;
      }

      let currentIterationText = '';
      const toolCallsMap = new Map();
      let finishReason = null;

      // 4. Stream tokens
      try {
        for await (const chunk of stream) {
          const choice = chunk.choices[0];
          const delta = choice?.delta || {};

          if (delta.content) {
            currentIterationText += delta.content;
            yield { type: 'text', content: delta.content };
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (!toolCallsMap.has(tc.index)) {
                toolCallsMap.set(tc.index, {
                  id: tc.id || '',
                  type: 'function',
                  function: { name: tc.function?.name || '', arguments: tc.function?.arguments || '' }
                });
              } else {
                const existing = toolCallsMap.get(tc.index);
                if (tc.id) existing.id += tc.id;
                if (tc.function?.name) existing.function.name += tc.function.name;
                if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
              }
            }
          }

          if (choice?.finish_reason) {
            finishReason = choice.finish_reason;
          }
        }
      } catch (streamErr) {
        console.error('[Agent] Error reading Groq stream:', streamErr);
        yield { type: 'error', message: `Stream error: ${streamErr.message}` };
        return;
      }

      const finalToolCalls = Array.from(toolCallsMap.values());
      console.log(`[Agent] Groq finished. Text length: ${currentIterationText.length}, Tool calls: ${finalToolCalls.length}, Finish reason: ${finishReason}`);
      
      // Append assistant message to history
      if (finalToolCalls.length > 0) {
        appendMessage(sessionId, { 
          role: 'assistant', 
          content: currentIterationText || "", 
          tool_calls: finalToolCalls 
        });
      } else if (currentIterationText) {
        appendMessage(sessionId, { role: 'assistant', content: currentIterationText });
      }

      if (finalToolCalls.length > 0) {
        // Execute tools
        for (const tc of finalToolCalls) {
          const name = tc.function.name;
          let args = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch (e) {
            console.error("[Agent] Failed to parse tool arguments:", e);
          }

          console.log(`[Agent] Calling tool: ${name}`);
          yield { type: 'tool_call', name, input: args };
          
          let result;
          try {
            result = await callMcpTool(name, args);
          } catch (toolErr) {
            console.error(`[Agent] Tool ${name} threw:`, toolErr);
            result = JSON.stringify({ error: toolErr.message });
          }
          
          yield { type: 'tool_result', name, result };

          // Handle 401/Unauthorized from any tool
          const resultStr = String(result).toLowerCase();
          if (resultStr.includes('401') || resultStr.includes('unauthorized') || resultStr.includes('invalid token')) {
            console.error(`[Agent] Tool ${name} returned 401/Unauthorized. Clearing session email.`);
            setEmail(sessionId, null);
          }

          // Helper to validate email format before saving to state
          const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

          // If send_otp was successful, update the pending email
          if (name === 'send_otp' && args.email && isValidEmail(args.email)) {
            setState(sessionId, 'pendingEmail', args.email);
          }

          if (name === 'verify_otp') {
            try {
              const data = typeof result === 'string' ? JSON.parse(result) : result;
              if (data.success || data.token) {
                const verifiedEmail = (args.email && isValidEmail(args.email)) ? args.email : pendingEmail;
                setEmail(sessionId, verifiedEmail);
                setState(sessionId, 'pendingEmail', null);
                if (String(result).includes('Fallback Mode')) {
                  setState(sessionId, 'isFallback', true);
                } else {
                  setState(sessionId, 'isFallback', false);
                }
              }
            } catch (e) {
              if (typeof result === 'string' && (result.includes('verified') || result.includes('Success'))) {
                const verifiedEmail = (args.email && isValidEmail(args.email)) ? args.email : pendingEmail;
                setEmail(sessionId, verifiedEmail);
                setState(sessionId, 'pendingEmail', null);
                if (result.includes('Fallback')) setState(sessionId, 'isFallback', true);
              }
            }
          }

          appendMessage(sessionId, {
            role: 'tool',
            tool_call_id: tc.id,
            name: name,
            content: String(result)
          });
        }
        // Loop back to let the model generate the final response with tool results
      } else {
        // Final response (no tools)
        if (!currentIterationText) {
          const fallbackValue = "How can I help you today?";
          yield { type: 'text', content: fallbackValue };
          appendMessage(sessionId, { role: 'assistant', content: fallbackValue });
        }
        yield { type: 'done' };
        isLooping = false;
      }
    }
    
    if (loopCount >= MAX_LOOPS) {
      console.error(`[Agent] Hit max loop count (${MAX_LOOPS})`);
      yield { type: 'error', message: 'Agent exceeded maximum iterations' };
    }
  } catch (outerErr) {
    console.error('[Agent] UNHANDLED ERROR in runAgentStream:', outerErr);
    yield { type: 'error', message: `Internal error: ${outerErr.message}` };
  }
}
