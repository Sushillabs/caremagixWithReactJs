import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw } from "lucide-react";
import useAmbientVisitNotes from "../../hooks/useAmbientVisitNotes";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import { getAmbientAiVoiceToken, ambientAiSave } from "../../api/hospitalApi";

const TABS = [
  { key: "chat", label: "Chat" },
  { key: "review", label: "Review & Save" },
];

const isValidEmailFormate = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function WaveformBars() {
  const heights = [6, 12, 18, 12, 6];
  return (
    <div className="flex items-center gap-0.5">
      {heights.map((h, i) => (
        <span key={i} className="w-0.5 rounded-full bg-emerald-400" style={{ height: h }} />
      ))}
    </div>
  );
}

function ReviewSaveTab({ lastResponse, sessionId }) {
  const [noteText, setNoteText] = useState(lastResponse?.note_text || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setNoteText(lastResponse?.note_text || "");
  }, [lastResponse?.note_text]);

  useEffect(() => {
    if (saveResult) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [saveResult]);

  const handleSave = async () => {
    setSaveError(null);
    if (!noteText.trim()) {
      setSaveError("Visit note cannot be empty.");
      return;
    }
    if (sendEmail && !isValidEmailFormate(email)) {
      setSaveError("Enter a valid email address, or turn off email.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await ambientAiSave({
        session_id: sessionId,
        note_text: noteText,
        send_email: sendEmail,
        recipient_email: sendEmail ? email.trim() : "",
      });
      setSaveResult(result);
    } catch (err) {
      setSaveError(err?.message || "Could not save visit note");
    } finally {
      setIsSaving(false);
    }
  };

  if (!lastResponse || lastResponse.status !== "generated") {
    return <p className="mt-3 px-3 text-sm text-gray-400">Finish the conversation and tap "Generate Visit Note" to review it here.</p>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Transcript</label>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
            To generate the PDF, save your changes below first.
          </span>
        </div>
        <textarea readOnly value={lastResponse.transcript || ""} className="mt-1 w-full min-h-[100px] border rounded p-2 text-xs text-gray-500 bg-gray-50" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">Visit Note</label>
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} className="mt-1 w-full min-h-[200px] border rounded p-2 text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
        Email this visit note
      </label>
      {sendEmail && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Recipient email"
          className="w-full border rounded p-2 text-sm"
        />
      )}

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save to patient record"}
      </button>

      {saveResult && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
          Visit note saved to the patient record.{saveResult.email_status ? ` ${saveResult.email_status}` : ""}
          {saveResult.pdf_path && (
            <button type="button" onClick={() => window.open(saveResult.pdf_path, "_blank")} className="ml-2 underline">
              Download
            </button>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default function VisitNotesAI() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const { turns, lastResponse, pending, error, send, stopAndGenerate, hydrateHistory, historyLoaded, sessionId, reset } = useAmbientVisitNotes();

  const voice = useDeepgramVoice({
    fetchToken: getAmbientAiVoiceToken,
    onUtterance: (text) => send(text, { include_audio: true }),
  });

  useEffect(() => {
    if (lastResponse?.audio_base64) {
      voice.playReply(lastResponse.audio_base64, lastResponse.audio_content_type).then(() => voice.resumeAfterTurn());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  useEffect(() => {
    if (lastResponse?.status === "generated") setActiveTab("review");
  }, [lastResponse]);

  const handleStart = async () => {
    setStarted(true);
    await hydrateHistory();
    voice.start();
  };

  const handleStartOver = async () => {
    if (pending) return;
    if (voice.isActive) voice.stop();
    await reset();
    await hydrateHistory();
    voice.start();
    setActiveTab("chat");
  };

  if (!started) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={handleStart}
          className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-10 py-6 hover:bg-emerald-100"
        >
          <div className="flex items-center gap-3">
            <WaveformBars />
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Mic size={26} />
            </span>
            <WaveformBars />
          </div>
          <span className="text-sm font-semibold text-emerald-700">Talk to Ai Care Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#F0FDF4] p-2 text-xs">
        <h3 className="text-xs font-bold text-gray-800">Create Visit Notes AI</h3>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? "font-medium text-emerald-600" : "text-gray-500 hover:text-gray-700"}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={voice.toggle}
            className={`flex items-center gap-1 ${voice.isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            {voice.isActive ? <Mic size={14} /> : <MicOff size={14} />}
            {voice.isActive ? "Stop Mic" : "Start Mic"}
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            disabled={pending}
            title="Clear this conversation and start a new visit note"
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={12} />
            Start New Session
          </button>
        </div>
      </div>

      {activeTab === "chat" && (
        <>
          <AgentChatThread bare turns={turns} pending={pending || !historyLoaded} error={error} emptyState="Starting..." />
          <AgentChatComposer
            onSubmit={(text) => send(text)}
            disabled={pending}
            voice={voice}
            placeholder="Talk or type your visit note answers..."
          />
          <div className="shrink-0 border-t border-gray-100 p-2 text-right">
            <button
              type="button"
              onClick={stopAndGenerate}
              disabled={pending || !historyLoaded}
              className="rounded-md bg-emerald-800 px-3 py-1.5 text-sm text-white hover:bg-emerald-900 disabled:opacity-50"
            >
              Generate Visit Note
            </button>
          </div>
        </>
      )}

      {activeTab === "review" && <ReviewSaveTab lastResponse={lastResponse} sessionId={sessionId} />}
    </div>
  );
}
