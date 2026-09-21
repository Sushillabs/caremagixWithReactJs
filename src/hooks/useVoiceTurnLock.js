import { useEffect, useRef } from "react";

export default function useVoiceTurnLock(voice, { pending, error }) {
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const { pauseForTurn, resumeAfterTurn } = voice;

  useEffect(() => {
    if (pending) pauseForTurn();
    else if (error) resumeAfterTurn();
  }, [pending, error, pauseForTurn, resumeAfterTurn]);

  return pendingRef;
}
