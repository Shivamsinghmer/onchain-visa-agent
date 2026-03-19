import Groq from 'groq-sdk';
import { getMcpToolsForGroq, callMcpTool } from './mcpClient.js';
import { getHistory, appendMessage, getEmail, setEmail, getState, setState } from './sessionStore.js';
import { SYSTEM_PROMPT } from './prompts.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export async function* runAgentStream(userMessage, sessionId) {
  try {
    console.log(`[Agent] runAgentStream called. Session: ${sessionId}, Message: "${userMessage}"`);

    // 1. Append user message to history
    appendMessage(sessionId, { role: 'user', content: userMessage });

    // 2. Fetch MCP tools
    let tools = [];
    try {
      tools = await getMcpToolsForGroq();
      console.log(`[Agent] Got ${tools.length} tools from MCP`);
    } catch (err) {
      console.error(`[Agent] Failed to get MCP tools:`, err);
    }

    let isLooping = true;
    let loopCount = 0;
    const MAX_LOOPS = 10;

    while (isLooping && loopCount < MAX_LOOPS) {
      loopCount++;
      console.log(`[Agent] Loop #${loopCount}`);

      const history = getHistory(sessionId);
      const email = getEmail(sessionId);
      const pendingEmail = getState(sessionId, 'pendingEmail');
      const isFallback = getState(sessionId, 'isFallback');

      console.log(`[Agent] State — Email: ${email}, PendingEmail: ${pendingEmail}, Fallback: ${isFallback}`);

      // ── Build context injection ──────────────────────────────────────────
      let contextMessage = '';

      if (email) {
        contextMessage = `SESSION STATUS: Authenticated.
User email: **${email}**
The user is fully verified. Proceed with their request directly.
Do NOT ask for email or OTP again.`;

      } else if (pendingEmail) {
        // CRITICAL: user message is already in history — reference it correctly
        contextMessage = `AUTHENTICATION IN PROGRESS.
Pending email: **${pendingEmail}** — OTP has been sent.

The user's most recent message in the conversation history is their OTP code.
INSTRUCTION: Call verify_otp immediately with:
  email: "${pendingEmail}"
  code: [the 6-digit number from the user's last message]

RULES:
- DO NOT treat the 6-digit number as an email address.
- DO NOT ask any questions.
- DO NOT ask for the email again.
- Just call verify_otp right now.`;

      } else {
        contextMessage = `AUTHENTICATION STATUS: Not authenticated.
The user has not provided their email yet.
INSTRUCTION: Ask for their email address.
When they provide a valid email (contains @ and a domain), call send_otp(email).

BLOCKED ACTIONS (require auth):
- Visa applications
- Payment processing
- Application tracking
- eSIM purchases and search

If user asks about ANY of these before authenticating:
"Please verify your email first. Enter your email address to continue."

IMPORTANT: If the user's message does NOT look like an email address
(e.g. it's a question, greeting, or request like "search visas to Dubai"):
Do NOT say "That doesn't look like a valid email."
Instead say: "To get started, please enter your email address. 
Once verified, I can help you with [what they asked]."`;
      }

      if (isFallback) {
        contextMessage += `\n\n[SYSTEM NOTE: Fallback Mode active. User verified via local mock OTP. 
Real API calls may return 401. Do NOT ask user to re-verify. 
Explain that staging server has limited functionality if protected calls fail.]`;
      }

      const contextPrompt = { role: 'system', content: contextMessage };
      const messages = [
        SYSTEM_PROMPT,
        contextPrompt,
        ...history.slice(-20)
      ];

      console.log(`[Agent] Calling Groq with ${messages.length} messages...`);

      let stream;
      try {
        stream = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? 'auto' : undefined,
          stream: true,
          temperature: 0.2, // lower = less hallucination
          max_tokens: 1024
        });
      } catch (err) {
        console.error('[Agent] Groq.create failed:', err);
        yield { type: 'error', message: `AI service error: ${err.message}` };
        return;
      }

      // ── Stream tokens ────────────────────────────────────────────────────
      let bufferedText = '';          // buffer text — only send after we know no tool calls
      const toolCallsMap = new Map();
      let finishReason = null;

      try {
        for await (const chunk of stream) {
          const choice = chunk.choices[0];
          const delta = choice?.delta || {};

          // Buffer text — don't yield yet (tool calls may follow)
          if (delta.content) {
            bufferedText += delta.content;
          }

          // Accumulate tool calls
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (!toolCallsMap.has(tc.index)) {
                toolCallsMap.set(tc.index, {
                  id: tc.id || `tool_${tc.index}`,
                  type: 'function',
                  function: {
                    name: tc.function?.name || '',
                    arguments: tc.function?.arguments || ''
                  }
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
        console.error('[Agent] Stream read error:', streamErr);
        yield { type: 'error', message: `Stream error: ${streamErr.message}` };
        return;
      }

      const finalToolCalls = Array.from(toolCallsMap.values());
      console.log(`[Agent] Finished. Text: ${bufferedText.length} chars, Tools: ${finalToolCalls.length}, Reason: ${finishReason}`);

      // ── Handle tool calls ────────────────────────────────────────────────
      if (finalToolCalls.length > 0) {
        // Append assistant message with tool calls (bufferedText may be empty or a preamble)
        appendMessage(sessionId, {
          role: 'assistant',
          content: bufferedText || '',
          tool_calls: finalToolCalls
        });

        // Execute each tool
        for (const tc of finalToolCalls) {
          const name = tc.function.name;
          let args = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch (e) {
            console.error(`[Agent] Failed to parse args for ${name}:`, e);
          }

          console.log(`[Agent] Calling tool: ${name} with args:`, JSON.stringify(args));
          yield { type: 'tool_call', name, input: args };

          let result;
          try {
            result = await callMcpTool(name, args);
          } catch (toolErr) {
            console.error(`[Agent] Tool ${name} threw:`, toolErr);
            result = JSON.stringify({ error: toolErr.message });
          }

          console.log(`[Agent] Tool ${name} result:`, String(result).substring(0, 200));
          yield { type: 'tool_result', name, result };

          const resultStr = String(result).toLowerCase();

          // Handle 401 — session expired
          if (resultStr.includes('"401"') || resultStr.includes('unauthorized') || resultStr.includes('invalid token')) {
            console.warn(`[Agent] Tool ${name} returned 401. Clearing session.`);
            setEmail(sessionId, null);
            setState(sessionId, 'pendingEmail', null);
          }

          // Store pending email after send_otp
          if (name === 'send_otp' && args.email && isValidEmail(args.email)) {
            setState(sessionId, 'pendingEmail', args.email);
            console.log(`[Agent] Stored pendingEmail: ${args.email}`);
          }

          // Handle verify_otp result
          if (name === 'verify_otp') {
            let parsed = null;
            try {
              parsed = typeof result === 'string' ? JSON.parse(result) : result;
            } catch (e) {
              // non-JSON result — check string content
            }

            const isSuccess = parsed?.success || parsed?.token ||
              (typeof result === 'string' && (
                result.toLowerCase().includes('verified') ||
                result.toLowerCase().includes('success')
              ));

            if (isSuccess) {
              // Use email from args, fallback to pendingEmail in state
              const verifiedEmail =
                (args.email && isValidEmail(args.email)) ? args.email
                  : getState(sessionId, 'pendingEmail');

              setEmail(sessionId, verifiedEmail);
              setState(sessionId, 'pendingEmail', null);
              setState(sessionId, 'isFallback',
                typeof result === 'string' && result.includes('Fallback')
              );
              console.log(`[Agent] Verified. Email set to: ${verifiedEmail}`);
            }
          }

          // Append tool result to history
          appendMessage(sessionId, {
            role: 'tool',
            tool_call_id: tc.id,
            name,
            content: String(result)
          });
        }

        // Loop continues — Groq will generate final response with tool results

      } else {
        // ── Final text response (no tool calls) ─────────────────────────
        const finalText = bufferedText.trim();

        if (finalText) {
          // Yield the complete buffered text at once
          yield { type: 'text', content: finalText };
          appendMessage(sessionId, { role: 'assistant', content: finalText });
        } else {
          // Groq returned nothing — this should not happen but handle gracefully
          console.warn('[Agent] Empty response from Groq. Sending safe fallback.');
          const fallback = 'I\'m here to help. What would you like to do?';
          yield { type: 'text', content: fallback };
          appendMessage(sessionId, { role: 'assistant', content: fallback });
        }

        yield { type: 'done' };
        isLooping = false;
      }
    }

    if (loopCount >= MAX_LOOPS) {
      console.error(`[Agent] Hit max loop count (${MAX_LOOPS}). Aborting.`);
      yield { type: 'error', message: 'The agent took too many steps. Please try again.' };
    }

  } catch (outerErr) {
    console.error('[Agent] UNHANDLED ERROR in runAgentStream:', outerErr);
    yield { type: 'error', message: `Internal error: ${outerErr.message}` };
  }
}