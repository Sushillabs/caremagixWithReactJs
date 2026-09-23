import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import useAmbientVisitNotes from "../../hooks/useAmbientVisitNotes";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import VoiceStartGate from "../../components/chat/VoiceStartGate";
import VoiceToggleButton from "../../components/chat/VoiceToggleButton";
import ConversationHoldToggle from "../../components/chat/ConversationHoldToggle";

const TABS = [
  { key: "chat", label: "Chat" },
  { key: "review", label: "Review & Save" },
];

// ?kind=discharge|handoff -> physician flow; absent -> caregiver visit note
const LABELS = { discharge: "Discharge Plan", handoff: "Handoff Note" };

const SKIP_MESSAGE = "I do not have information, move to the next section without asking follow up questions";

const isValidEmailFormate = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function ReviewSaveTab({ lastResponse, sessionId, saveNote, label }) {
  const [noteText, setNoteText] = useState(lastResponse?.note_text || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setNoteText(lastResponse?.note_text || "");
  }, [lastResponse?.note_text]);

  useEffect(() => {
    if (saveResult) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [saveResult]);

  const submit = async (withEmail, setBusy) => {
    setSaveError(null);
    if (!noteText.trim()) {
      setSaveError(`${label} cannot be empty.`);
      return;
    }
    if (withEmail && !isValidEmailFormate(email)) {
      setSaveError("Enter a valid email address, or turn off email.");
      return;
    }
    setBusy(true);
    try {
      const result = await saveNote({
        session_id: sessionId,
        note_text: noteText,
        send_email: withEmail,
        recipient_email: withEmail ? email.trim() : "",
      });
      setSaveResult(result);
    } catch (err) {
      setSaveError(err?.message || `Could not save ${label.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => submit(sendEmail, setIsSaving);
  const handleSendEmail = () => submit(true, setIsSending);

  if (!lastResponse || lastResponse.status !== "generated") {
    return <p className="mt-3 px-3 text-sm text-gray-400">Finish the conversation and tap "Generate {label}" to review it here.</p>;
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
        <textarea
          readOnly
          value={lastResponse.transcript || ""}
          className="mt-1 w-full min-h-[100px] border rounded p-2 text-xs text-gray-500 bg-gray-50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">{label}</label>
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} className="mt-1 w-full min-h-[200px] border rounded p-2 text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
        Email this {label.toLowerCase()}
      </label>
      {sendEmail && (
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Recipient email"
            className="min-w-0 flex-1 border rounded p-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSaving || isSending || !email.trim()}
            className="shrink-0 rounded bg-emerald-800 px-3 py-2 text-sm text-white hover:bg-emerald-900 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      )}

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isSending}
        className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save to patient record"}
      </button>

      {saveResult && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
          {label} saved to the patient record.{saveResult.email_status ? ` ${saveResult.email_status}` : ""}
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
  const [searchParams] = useSearchParams();
  const kindParam = searchParams.get("kind");
  const noteKind = kindParam === "discharge" || kindParam === "handoff" ? kindParam : null;
  const label = LABELS[noteKind] || "Visit Note";

  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const {
    turns,
    lastResponse,
    pending,
    error,
    send,
    stopAndGenerate,
    hydrateHistory,
    historyLoaded,
    sessionId,
    reset,
    saveNote,
    fetchVoiceToken,
    speakStream,
    speakBase64,
  } = useAmbientVisitNotes({ noteKind });

  const voice = useDeepgramVoice({
    fetchToken: fetchVoiceToken,
    onUtterance: (text) => send(text),
  });

  // Streams the question's audio as it's generated (falls back to a plain
  // base64 clip if streaming fails or is aborted for any other reason), then
  // hands the mic back. speakAbortRef lets "Talk now" cut the fetch itself,
  // not just the playback.
  const speakAbortRef = useRef(null);
  const speak = async (text) => {
    if (!text) return;
    const controller = new AbortController();
    speakAbortRef.current = controller;
    try {
      const res = await speakStream(text, controller.signal);
      if (!res.ok || !res.body) throw new Error("stream failed");
      await voice.playStream(res);
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          const data = await speakBase64(text);
          if (data?.audio_base64) await voice.playReply(data.audio_base64, data.audio_content_type);
        } catch {
          /* text is already shown either way — give up on audio silently */
        }
      }
    } finally {
      if (speakAbortRef.current === controller) speakAbortRef.current = null;
      voice.resumeAfterTurn();
    }
  };

  const handleTalkNow = () => {
    speakAbortRef.current?.abort();
    voice.interruptSpeech();
  };

  const handleSkip = () => {
    speakAbortRef.current?.abort();
    voice.interruptSpeech();
    send(SKIP_MESSAGE, { displayText: "Skipped" });
  };

  useEffect(() => {
    if (lastResponse?.message) speak(lastResponse.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  useEffect(() => {
    if (lastResponse?.status === "generated") setActiveTab("review");
  }, [lastResponse]);

  const handleStart = async () => {
    setStarted(true);
    // Start the voice session before speaking, not after — playStream/playReply
    // only flip state to "speaking" (and mute the mic) once the session is
    // active, so starting late left the very first reply invisible to any
    // "speaking"-gated UI (Talk now, the Pause/Answer toggle).
    voice.start();
    const res = await hydrateHistory();
    if (res?.message) await speak(res.message);
  };

  const handleStartOver = async () => {
    if (pending) return;
    if (voice.isActive) voice.stop();
    await reset();
    voice.start();
    const res = await hydrateHistory();
    if (res?.message) await speak(res.message);
    setActiveTab("chat");
  };

  if (!started) {
    return <VoiceStartGate label="Talk to Caremagix AI Assistant" onStart={handleStart} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#F0FDF4] p-2 text-xs">
        <h3 className="text-xs font-bold text-gray-800">Create {label} AI</h3>
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
          <VoiceToggleButton voice={voice} />
          <ConversationHoldToggle voice={voice} />
          <button
            type="button"
            onClick={handleStartOver}
            disabled={pending}
            title={`Clear this conversation and start a new ${label.toLowerCase()}`}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={12} />
            Start New Session
          </button>
        </div>
      </div>

      {activeTab === "chat" && (
        <>
          <AgentChatThread
            bare
            turns={turns}
            pending={pending || !historyLoaded}
            error={error}
            emptyState="Starting..."
            liveText={voice.transcript}
            renderExtra={(meta, { isLast }) =>
              isLast &&
              meta?.status !== "generated" && (
                <div>
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={pending || !historyLoaded}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    skip and move to the next section
                  </button>
                </div>
              )
            }
          />
          {voice.state === "speaking" && (
            <div className="shrink-0 flex items-center justify-between gap-2 border-t border-gray-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
              <span>Speaking… tap Answer now or the mic to interrupt and answer.</span>
              <button
                type="button"
                onClick={handleTalkNow}
                className="shrink-0 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Answer now
              </button>
            </div>
          )}
          <AgentChatComposer
            onSubmit={(text) => send(text)}
            disabled={pending}
            voice={voice}
            placeholder={`Talk or type your ${label.toLowerCase()} answers...`}
          />
          <div className="shrink-0 border-t border-gray-100 p-2 text-right">
            <button
              type="button"
              onClick={stopAndGenerate}
              disabled={pending || !historyLoaded}
              className="rounded-md bg-emerald-800 px-3 py-1.5 text-sm text-white hover:bg-emerald-900 disabled:opacity-50"
            >
              Generate {label}
            </button>
          </div>
        </>
      )}

      {activeTab === "review" && <ReviewSaveTab lastResponse={lastResponse} sessionId={sessionId} saveNote={saveNote} label={label} />}
    </div>
  );
}
