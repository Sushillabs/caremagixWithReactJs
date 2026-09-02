import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useDeepgramVoice from "./useDeepgramVoice";
import { getPhysicianAmbientVoiceToken, physicianAmbientStart, physicianAmbientStop, physicianAmbientSave } from "../api/hospitalApi";

// Matches the labels ambient_ai/agent.py's format_note_text writes — query_api.py's
// parse_note_content reads any "LABEL: value" line generically, so rebuilding with
// these same labels is all that's required to stay compatible with the PDF renderer.
const SECTION_LABELS = [
  ["chief_complaint", "CHIEF COMPLAINT"],
  ["subjective", "SUBJECTIVE"],
  ["objective", "OBJECTIVE"],
  ["assessment", "ASSESSMENT"],
  ["plan", "PLAN"],
];

// Rebuilds note_text from edited SOAP fields, keeping the original header block
// (Patient / Visit Date / Prepared By) exactly as the backend generated it.
function rebuildNoteText(originalNoteText, soapFields) {
  const header = (originalNoteText || "Visit Notes").split("\n\n")[0];
  const lines = SECTION_LABELS.map(([key, label]) => {
    const value = (soapFields?.[key] || "").replace(/\s+/g, " ").trim() || "Not documented";
    return `${label}: ${value}`;
  });
  return `${header}\n\n${lines.join("\n")}\n`;
}

// Physician Ambient AI: passive continuous listener, not a chat — no turns, no
// next_question. See caremagix-be/ambient_ai/routes.py. Session shape here
// mirrors that backend directly (start -> stop -> save), unlike
// useAmbientVisitNotes (caregiver-ambient-ai), which adapts a turn-based
// interview onto useAgentChat's generic {session_id, message} contract.
export default function usePhysicianAmbientSession() {
  const patientData = useSelector((state) => state?.patientsingledata?.value);

  const [phase, setPhase] = useState("idle"); // idle | recording | generating | review | saving | saved
  const [sessionId, setSessionId] = useState(null);
  const [utterances, setUtterances] = useState([]);
  const [soap, setSoap] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [error, setError] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

  // Authoritative accumulator read by stopAndGenerate — a ref so the value used
  // to build the outgoing transcript is never a stale render's closure, while
  // `utterances` state (kept in lockstep) drives the live display.
  const utterancesRef = useRef([]);
  // Which patient the running session was started for — compared against the
  // redux-selected patient below to catch a mid-visit patient switch.
  const activePatientNameRef = useRef(null);

  const pushUtterance = useCallback((text) => {
    if (!text) return;
    utterancesRef.current = [...utterancesRef.current, text];
    setUtterances(utterancesRef.current);
  }, []);

  const voice = useDeepgramVoice({
    fetchToken: getPhysicianAmbientVoiceToken,
    onUtterance: pushUtterance,
  });

  const errorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

  const beginSession = useCallback(async () => {
    setError(null);
    utterancesRef.current = [];
    setUtterances([]);
    try {
      const session = await physicianAmbientStart({
        patient_name: patientData?.patient_name,
        patient_type: patientData?.patient_type,
      });
      activePatientNameRef.current = patientData?.patient_name || null;
      setSessionId(session.session_id);
      await voice.start();
      setPhase("recording");
    } catch (err) {
      setError(errorMessage(err, "Could not start Ambient AI"));
      setPhase("idle");
    }
  }, [patientData, voice]);

  // Patient-switch guard — mirrors physician-view.html's ambient_ai.js: abandon
  // the session rather than let a different patient's words land in this note.
  const abort = useCallback(
    (message) => {
      if (voice.isActive) voice.stop();
      utterancesRef.current = [];
      activePatientNameRef.current = null;
      setUtterances([]);
      setSessionId(null);
      setPhase("idle");
      setError(message || null);
    },
    [voice]
  );

  useEffect(() => {
    const recordedFor = activePatientNameRef.current;
    const current = patientData?.patient_name || null;
    if (recordedFor && current && recordedFor !== current && (phase === "recording" || phase === "generating")) {
      abort("Ambient AI stopped because a different patient was selected. The draft was not saved.");
    }
  }, [patientData?.patient_name, phase, abort]);

  const pause = useCallback(() => voice.pauseListening(), [voice]);
  const resume = useCallback(() => voice.resumeListening(), [voice]);

  const stopAndGenerate = useCallback(async () => {
    if (voice.isActive) {
      if (!voice.isPaused) pushUtterance(voice.drainPendingTranscript());
      voice.stop();
    }
    setPhase("generating");
    setError(null);

    const transcript = utterancesRef.current.join(" ").replace(/\s+/g, " ").trim();
    try {
      const session = await physicianAmbientStop({ session_id: sessionId, transcript });
      setSoap(session.soap || {});
      setNoteText(session.note_text || "");
      setTranscriptPreview(session.transcript || transcript);
      setPhase("review");
    } catch (err) {
      // Stays on "review" with soap left unset — the panel shows a retry
      // action that just calls stopAndGenerate again (safe: mic is already
      // stopped, the accumulated transcript is untouched, and the backend
      // allows regenerating from the same session more than once).
      setError(errorMessage(err, "Could not generate the visit note"));
      setPhase("review");
    }
  }, [voice, sessionId, pushUtterance]);

  const saveNote = useCallback(
    async (editedSoap) => {
      setPhase("saving");
      setError(null);
      try {
        const result = await physicianAmbientSave({
          session_id: sessionId,
          note_text: rebuildNoteText(noteText, editedSoap),
        });
        setSaveResult(result);
        setPhase("saved");
      } catch (err) {
        setError(errorMessage(err, "Could not save the visit note"));
        setPhase("review");
      }
    },
    [sessionId, noteText]
  );

  const reset = useCallback(() => {
    if (voice.isActive) voice.stop();
    utterancesRef.current = [];
    activePatientNameRef.current = null;
    setUtterances([]);
    setSessionId(null);
    setSoap(null);
    setNoteText("");
    setTranscriptPreview("");
    setSaveResult(null);
    setError(null);
    setPhase("idle");
  }, [voice]);

  return {
    phase,
    patientName: patientData?.patient_name || "",
    voice,
    completedTranscript: utterances.join(" "),
    soap,
    transcriptPreview,
    error,
    saveResult,
    beginSession,
    pause,
    resume,
    stopAndGenerate,
    saveNote,
    reset,
    abort,
  };
}
