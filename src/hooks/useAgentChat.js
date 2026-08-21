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

  const send = useCallback(
    async (message, opts = {}) => {
      const text = message?.trim();
      if (!text || pending) return null;

      setError(null);
      setTurns((prev) => [...prev, { role: "user", content: text }]);
      setPending(true);
      try {
        const response = await sendMessage({
          message: text,
          session_id: sessionIdRef.current || undefined,
          ...opts,
        });
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
    [sendMessage, pending]
  );

  // Hydrates prior turns for today's/this session's thread. Only runs once
  // per mount — call reset() first if a fresh session is needed.
  const hydrateHistory = useCallback(async () => {
    if (!loadHistory || historyLoaded) return null;
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
  }, [loadHistory, historyLoaded]);

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
    setHistoryLoaded(false);
  }, [clearSession]);

  return { sessionId, turns, lastResponse, pending, error, historyLoaded, send, hydrateHistory, reset };
}
