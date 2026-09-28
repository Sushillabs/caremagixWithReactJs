import { useEffect } from "react";

const isAuthStatus = (value) => value === 401 || value === 403;

// Stops the mic as soon as the feature's own API calls come back 401/403 —
// otherwise the session keeps listening and posting utterances that can only
// fail. Pass any mix of statuses, errors or booleans the caller has.
export default function useStopVoiceOnAuthError(voice, signals = [], onStop) {
  const stop = voice?.stop;
  const flagged = (Array.isArray(signals) ? signals : [signals]).some((signal) => {
    if (signal === true) return true;
    if (typeof signal === "number") return isAuthStatus(signal);
    return isAuthStatus(signal?.response?.status ?? signal?.status);
  });

  useEffect(() => {
    if (!flagged) return;
    onStop?.();
    stop?.();
  }, [flagged, stop, onStop]);
}
