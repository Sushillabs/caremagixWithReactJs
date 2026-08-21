import { useCallback, useEffect, useRef, useState } from "react";
import DeepgramVoiceSession from "../utils/deepgramVoiceSession";

// Generic mic-in/speaker-out voice hook — not tied to any one feature's
// backend. `fetchToken` supplies the short-lived Deepgram token from
// whichever `/*/voice/live-token` endpoint the caller needs (hf-wellness,
// physician-appointment, ...); `onUtterance` receives each finished
// utterance's transcript to forward into that feature's chat send().
export default function useDeepgramVoice({ fetchToken, onUtterance, continuous = true }) {
  const [state, setState] = useState("idle"); // idle | connecting | listening | paused | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const sessionRef = useRef(null);
  const onUtteranceRef = useRef(onUtterance);
  onUtteranceRef.current = onUtterance;

  useEffect(() => {
    sessionRef.current = new DeepgramVoiceSession({
      continuous,
      fetchToken,
      onStateChange: setState,
      onTranscript: setTranscript,
      onUtterance: (text) => onUtteranceRef.current?.(text),
      onError: setError,
    });
    return () => sessionRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => sessionRef.current?.start(), []);
  const stop = useCallback(() => sessionRef.current?.stop(), []);
  const toggle = useCallback(() => sessionRef.current?.toggle(), []);
  const pauseForTurn = useCallback(() => sessionRef.current?.pauseForTurn(), []);
  const resumeAfterTurn = useCallback(() => sessionRef.current?.resumeAfterTurn(), []);
  const playReply = useCallback((base64Audio, contentType) => sessionRef.current?.playBase64Audio(base64Audio, contentType), []);
  const stopPlayback = useCallback(() => sessionRef.current?.stopPlayback(), []);

  return {
    state,
    transcript,
    error,
    isActive: state !== "idle",
    start,
    stop,
    toggle,
    pauseForTurn,
    resumeAfterTurn,
    playReply,
    stopPlayback,
  };
}
