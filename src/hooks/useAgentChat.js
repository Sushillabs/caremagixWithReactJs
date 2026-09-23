import { useCallback, useRef, useState } from "react";

// Generic chat-agent session hook — not tied to any one feature's backend.
// Every agent-chat endpoint in this app (hf-wellness, physician-appointment,
// ...) shares the same shape: POST a message (+ optional session_id), get
// back {session_id, message, ...feature-specific extras}. This hook owns
// session_id/turns/pending state; the caller supplies the actual API calls.
export default function useAgentChat({ sendMessage, loadHistory, clearSession } = {}) {
  const [sessionId, setSessionId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [lastResponse, setLastResponse] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const sessionIdRef = useRef(null);
  sessionIdRef.current = sessionId;
  // Mirrors `historyLoaded` but updates synchronously — reset() followed
  // immediately by hydrateHistory() (e.g. a "start over" handler) would
  // otherwise call hydrateHistory() with the stale pre-reset `historyLoaded`
  // still closed over, since the state update hasn't re-rendered yet.
  const historyLoadedRef = useRef(false);

  // Runs an arbitrary async call and records its result as an assistant-only
  // turn — no user message pushed first. `send` (below) is the common case
  // (user typed/spoke something); this is for actions the agent takes on its
  // own, e.g. a "generate now" button that has no user message to echo.
  const runAction = useCallback(
    async (action) => {
      if (pending) return null;
      setError(null);
      setPending(true);
      try {
        const response = await action();
        setSessionId(response?.session_id || sessionIdRef.current);
        setLastResponse(response);
        setTurns((prev) => [...prev, { role: "assistant", content: response?.message, meta: response }]);
        return response;
      } catch (err) {
        setError(err?.message || "Something went wrong");
        throw err;
      } finally {
        setPending(false);
      }
    },
    [pending]
  );

  const send = useCallback(
    async (message, { displayText, ...opts } = {}) => {
      const text = message?.trim();
      if (!text || pending) return null;

      setTurns((prev) => [...prev, { role: "user", content: displayText ?? text }]);
      return runAction(() =>
        sendMessage({
          message: text,
          session_id: sessionIdRef.current || undefined,
          ...opts,
        })
      );
    },
    [sendMessage, pending, runAction]
  );

  // Hydrates prior turns for today's/this session's thread. Only runs once
  // per mount — call reset() first if a fresh session is needed.
  const hydrateHistory = useCallback(async () => {
    if (!loadHistory || historyLoadedRef.current) return null;
    historyLoadedRef.current = true;
    setHistoryLoaded(true);
    try {
      const res = await loadHistory({ session_id: sessionIdRef.current || undefined });
      setSessionId(res?.session_id || sessionIdRef.current);
      setTurns((res?.chat_history || []).map((item) => ({ role: item.role, content: item.content })));
      return res;
    } catch (err) {
      setError(err?.message || "Could not load history");
      return null;
    }
  }, [loadHistory]);

  const reset = useCallback(async () => {
    if (clearSession) {
      try {
        await clearSession({ session_id: sessionIdRef.current || undefined });
      } catch {
        // Best-effort, matches legacy's complete: callback — a fresh
        // session starts locally regardless of whether the server-side
        // clear succeeded (it's just an archive step, nothing depends on it).
      }
    }
    setSessionId(null);
    setTurns([]);
    setLastResponse(null);
    setError(null);
    historyLoadedRef.current = false;
    setHistoryLoaded(false);
  }, [clearSession]);

  return { sessionId, turns, lastResponse, pending, error, historyLoaded, send, runAction, hydrateHistory, reset };
}
