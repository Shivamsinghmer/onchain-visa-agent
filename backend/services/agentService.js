import Groq from 'groq-sdk';
import { getMcpToolsForGroq, callMcpTool } from './mcpClient.js';
import { getHistory, appendMessage, getEmail, setEmail, getState, setState } from './sessionStore.js';
import { SYSTEM_PROMPT } from './prompts.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function* runAgentStream(userMessage, sessionId) {
  // 1. Append user message to session history
  appendMessage(sessionId, { role: 'user', content: userMessage });
  
  // 2. Fetch tools from MCP
  const tools = await getMcpToolsForGroq();

  let isLooping = true;
  while (isLooping) {
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
    console.log(`[Agent] Calling Groq with ${messages.length} messages...`);
    const stream = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages,
      tools,
      tool_choice: 'auto',
      stream: true
    });

    let currentIterationText = '';
    const toolCallsMap = new Map();
    let finishReason = null;

    // 4. Stream tokens
    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const delta = choice?.delta || {};

      if (delta.content) {
        currentIterationText += delta.content;
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

    const finalToolCalls = Array.from(toolCallsMap.values());
    console.log(`[Agent] Groq finished. Tool calls: ${finalToolCalls.length}, Finish reason: ${finishReason}`);
    
    if (finalToolCalls.length > 0) {
      // Append assistant message with tools to history
      appendMessage(sessionId, { 
        role: 'assistant', 
        content: currentIterationText || "", 
        tool_calls: finalToolCalls 
      });

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
        const result = await callMcpTool(name, args);
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
              setState(sessionId, 'pendingEmail', null); // Clear pending
              if (String(result).includes('Fallback Mode')) {
                setState(sessionId, 'isFallback', true);
              } else {
                setState(sessionId, 'isFallback', false);
              }
            }
          } catch (e) {
            if (result.includes('verified') || result.includes('Success')) {
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
    } else {
      // Final response
      let finalContent = currentIterationText || "How can I help you today?";
      yield { type: 'text', content: finalContent };
      appendMessage(sessionId, { role: 'assistant', content: finalContent });
      yield { type: 'done' };
      isLooping = false;
    }
  }
}
