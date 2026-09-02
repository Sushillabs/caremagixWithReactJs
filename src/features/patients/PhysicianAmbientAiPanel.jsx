import { useEffect, useState } from "react";
import { Mic, Pause, Play, Square, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import usePhysicianAmbientSession from "../../hooks/usePhysicianAmbientSession";

const FIELDS = [
  { key: "chief_complaint", label: "Chief Complaint", rows: 1 },
  { key: "subjective", label: "Subjective", rows: 3 },
  { key: "objective", label: "Objective", rows: 2 },
  { key: "assessment", label: "Assessment", rows: 2 },
  { key: "plan", label: "Plan", rows: 2 },
];

function formatElapsed(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function ConsentModal({ patientName, onCancel, onConfirm }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/45 p-4">
      <div className="w-full max-w-xs rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-800">Start Ambient AI</h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-gray-600">
          This will listen to your conversation with <strong className="text-gray-800">{patientName || "this patient"}</strong> to draft a visit
          note.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          The transcript is only used to write the note — it isn't saved to the chart. You can pause or stop at any time.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
}

function IdleBody({ onStart }) {
  return (
    <div className="flex flex-col items-center gap-2 px-8 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <Mic size={28} className="text-emerald-600" />
      </div>
      <h4 className="mt-1 text-sm font-semibold text-gray-800">Ready when you are</h4>
      <p className="max-w-xs text-[13px] leading-relaxed text-gray-500">
        Start Ambient AI to record this visit. It listens quietly in the background and drafts a SOAP note when you're done — nothing is saved
        until you review it.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
      >
        <Mic size={13} />
        Start Ambient AI
      </button>
    </div>
  );
}

function RecordingHeader({ elapsedMs, isPaused, onPause, onResume, onStop }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-100 bg-[#F0FDF4] px-3 py-2">
      <span className={`h-2 w-2 shrink-0 rounded-full bg-red-600 ${isPaused ? "" : "animate-pulse"}`} />
      <span className="text-xs font-bold text-gray-800">{isPaused ? "Paused" : "Recording"}</span>
      <span className="font-mono text-xs tabular-nums text-gray-600">{formatElapsed(elapsedMs)}</span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={isPaused ? onResume : onPause}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        {isPaused ? <Play size={11} /> : <Pause size={11} />}
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button
        type="button"
        onClick={onStop}
        className="flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
      >
        <Square size={11} />
        Stop &amp; Generate
      </button>
    </div>
  );
}

function RecordingBody({ completedTranscript, interimText }) {
  const hasContent = completedTranscript || interimText;
  return (
    <div className="p-3">
      <div className="max-h-56 overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-3 text-[13px] leading-relaxed">
        {hasContent ? (
          <p className="text-gray-600">
            {completedTranscript}
            {interimText && <span className="italic text-gray-400"> {interimText}</span>}
          </p>
        ) : (
          <p className="text-gray-400">Listening…</p>
        )}
      </div>
      <p className="mt-2 text-[11px] text-gray-400">This preview isn't saved. Tap Stop &amp; Generate when the visit is done.</p>
    </div>
  );
}

function ReviewBody({ session, fields, setFields }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const generateFailed = !session.soap && session.error;

  if (generateFailed) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="text-sm text-red-600">{session.error}</p>
        <button
          type="button"
          onClick={session.stopAndGenerate}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 p-4">
      <button
        type="button"
        onClick={() => setShowTranscript((v) => !v)}
        className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500"
      >
        <span>Transcript · reference only</span>
        {showTranscript ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {showTranscript && (
        <p className="-mt-2 max-h-40 overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
          {session.transcriptPreview || "No transcript captured."}
        </p>
      )}

      {FIELDS.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">{field.label}</label>
          <textarea
            rows={field.rows}
            value={fields[field.key] || ""}
            onChange={(e) => setFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full resize-none rounded-md border border-gray-200 p-2 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
      ))}
    </div>
  );
}

export default function PhysicianAmbientAiPanel() {
  const session = usePhysicianAmbientSession();
  const [showConsent, setShowConsent] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [fields, setFields] = useState({ chief_complaint: "", subjective: "", objective: "", assessment: "", plan: "" });

  useEffect(() => {
    if (session.soap) setFields(session.soap);
  }, [session.soap]);

  useEffect(() => {
    if (session.phase === "idle") setElapsedMs(0);
  }, [session.phase]);

  useEffect(() => {
    if (session.phase !== "recording" || session.voice.isPaused) return undefined;
    const startedAt = Date.now() - elapsedMs;
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase, session.voice.isPaused]);

  const handleConfirmConsent = () => {
    setShowConsent(false);
    session.beginSession();
  };

  const handleDiscardReview = () => {
    if (window.confirm("Discard this visit note without saving?")) session.reset();
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      {session.phase === "idle" && (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 bg-[#F0FDF4] px-3 py-2">
            <span className="text-xs font-bold text-gray-800">Ambient AI — Visit Notes</span>
          </div>
          {session.error && <p className="px-3 pt-2 text-xs text-red-600">{session.error}</p>}
          <IdleBody onStart={() => setShowConsent(true)} />
          {showConsent && (
            <ConsentModal patientName={session.patientName} onCancel={() => setShowConsent(false)} onConfirm={handleConfirmConsent} />
          )}
        </>
      )}

      {session.phase === "recording" && (
        <>
          <RecordingHeader
            elapsedMs={elapsedMs}
            isPaused={session.voice.isPaused}
            onPause={session.pause}
            onResume={session.resume}
            onStop={session.stopAndGenerate}
          />
          <RecordingBody completedTranscript={session.completedTranscript} interimText={session.voice.transcript} />
        </>
      )}

      {session.phase === "generating" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Creating a SOAP note from the conversation…</p>
        </div>
      )}

      {(session.phase === "review" || session.phase === "saving") && (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 bg-[#F0FDF4] px-3 py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-gray-800">Review Visit Note</span>
              <span className="text-[11.5px] text-gray-500">{session.patientName}</span>
            </div>
            <button type="button" onClick={handleDiscardReview} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
              Discard
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ReviewBody session={session} fields={fields} setFields={setFields} />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3">
            <span className="text-[11px] text-gray-400">Nothing is saved until you confirm</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscardReview}
                disabled={session.phase === "saving"}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => session.saveNote(fields)}
                disabled={session.phase === "saving" || (!session.soap && !!session.error)}
                className="rounded-md bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
              >
                {session.phase === "saving" ? "Saving…" : "Save to Patient Record"}
              </button>
            </div>
          </div>
        </>
      )}

      {session.phase === "saved" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">✓</div>
          <p className="text-sm font-semibold text-gray-800">Visit note saved to the patient record.</p>
          {session.saveResult?.pdf_path && (
            <button
              type="button"
              onClick={() => window.open(session.saveResult.pdf_path, "_blank")}
              className="text-xs font-semibold text-emerald-700 underline"
            >
              Download PDF
            </button>
          )}
          <button
            type="button"
            onClick={session.reset}
            className="mt-1 flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={12} />
            Start New Session
          </button>
        </div>
      )}
    </div>
  );
}
