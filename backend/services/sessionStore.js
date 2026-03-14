const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], email: null });
  }
  return sessions.get(sessionId);
}

export function appendMessage(sessionId, message) {
  const session = getSession(sessionId);
  session.history.push(message);
}

export function setState(sessionId, key, value) {
  const session = getSession(sessionId);
  if (!session.state) session.state = {};
  session.state[key] = value;
}

export function getState(sessionId, key) {
  const session = getSession(sessionId);
  return session.state ? session.state[key] : null;
}

export function getHistory(sessionId) {
  const session = getSession(sessionId);
  return session.history;
}

export function setEmail(sessionId, email) {
  const session = getSession(sessionId);
  session.email = email;
}

export function getEmail(sessionId) {
  const session = getSession(sessionId);
  return session.email;
}

export function clearHistory(sessionId) {
  sessions.delete(sessionId);
}
