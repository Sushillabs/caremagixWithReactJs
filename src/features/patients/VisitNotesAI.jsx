import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, EllipsisVertical, Mic, RotateCcw } from "lucide-react";
import useAmbientVisitNotes from "../../hooks/useAmbientVisitNotes";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import useStopVoiceOnAuthError from "../../hooks/useStopVoiceOnAuthError";
import useRefreshOpenPatient, { NEW_DOC_REFRESH_DELAY_MS } from "../../hooks/useRefreshOpenPatient";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import VoiceStartGate from "../../components/chat/VoiceStartGate";
import VoiceToggleButton from "../../components/chat/VoiceToggleButton";
import ConversationHoldToggle from "../../components/chat/ConversationHoldToggle";
import VoiceDock from "../../components/chat/VoiceDock";

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
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const bottomRef = useRef(null);
  const refreshOpenPatient = useRefreshOpenPatient();

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
      refreshOpenPatient(NEW_DOC_REFRESH_DELAY_MS);
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
    <div className="flex min-h-0 flex-1 flex-col md:overflow-y-auto md:p-3">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:flex-none md:overflow-visible md:p-0">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTranscriptOpen((v) => !v)}
              aria-expanded={transcriptOpen}
              className="flex min-h-9 items-center gap-1 text-xs font-semibold text-gray-600 compact:min-h-7 md:hidden"
            >
              Transcript · {transcriptOpen ? "hide" : "tap to view"}
              <ChevronDown size={14} className={transcriptOpen ? "rotate-180" : ""} />
            </button>
            <label className="hidden text-xs font-semibold text-gray-600 md:inline">Transcript</label>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800 compact:leading-tight">
              To generate the PDF, save your changes below first.
            </span>
          </div>
          <textarea
            readOnly
            value={lastResponse.transcript || ""}
            className={`mt-1 w-full min-h-[100px] border rounded p-2 text-xs text-gray-500 bg-gray-50 md:block ${transcriptOpen ? "block" : "hidden"}`}
          />
        </div>

        <div className="flex min-h-[200px] flex-1 flex-col compact:min-h-40 md:block md:min-h-0">
          <label className="text-xs font-semibold text-gray-600">{label}</label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="small-text-ok mt-1 w-full min-h-[200px] flex-1 border rounded p-2 text-xs leading-relaxed compact:min-h-40 md:flex-none md:text-sm md:leading-normal"
          />
        </div>

        <label className="flex min-h-10 items-center gap-2 text-sm text-gray-700 compact:min-h-8 max-[359px]:text-[0.75rem] md:min-h-0">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-emerald-700 compact:h-4 compact:w-4 md:h-auto md:w-auto"
          />
          Email this {label.toLowerCase()}
        </label>
        {sendEmail && (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Recipient email"
              className="h-10 min-w-0 flex-1 border rounded px-2 text-sm compact:h-9 md:h-auto md:p-2"
            />
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSaving || isSending || !email.trim()}
              className="h-10 shrink-0 rounded bg-emerald-800 px-3 text-sm text-white compact:h-9 md:h-auto md:py-2 hover:bg-emerald-900 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        )}

      </div>

      <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:mt-3 md:space-y-3 md:border-0 md:p-0">
        {saveError && (
          <p role="alert" className="text-sm text-red-600">
            {saveError}
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isSending}
          className="w-full px-3 py-2.5 text-sm font-medium bg-emerald-800 hover:bg-emerald-900 text-white rounded disabled:opacity-50 compact:py-2 md:w-auto md:py-2 md:text-base md:font-normal"
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
  const [typeMode, setTypeMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    turns,
    lastResponse,
    pending,
    error,
    errorStatus,
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

  useStopVoiceOnAuthError(voice, errorStatus, () => speakAbortRef.current?.abort());

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

  const handleGenerate = () => {
    speakAbortRef.current?.abort();
    voice.stop();
    stopAndGenerate();
  };

  useEffect(() => {
    if (lastResponse?.status === "generated") voice.stop();
    else if (lastResponse?.message) speak(lastResponse.message);
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
    speakAbortRef.current?.abort();
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
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white short:min-h-80">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-gray-100 bg-[#F0FDF4] p-2 pb-0 text-xs compact:gap-y-0 compact:pt-1 md:gap-2 md:pb-2">
        <h3 className="min-w-0 flex-1 basis-0 truncate text-xs font-bold text-gray-800 md:flex-none md:basis-auto">Create {label} AI</h3>
        {activeTab === "chat" && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={pending || !historyLoaded}
            className="ml-auto min-h-9 shrink-0 rounded-full bg-emerald-800 px-3 compact:min-h-7 text-xs font-medium text-white disabled:opacity-50 md:hidden"
          >
            Generate
          </button>
        )}
        <div className={`relative md:hidden ${activeTab === "chat" ? "" : "ml-auto"}`}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 compact:h-7 compact:w-7"
          >
            <EllipsisVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleStartOver();
                  }}
                  disabled={pending}
                  className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-gray-700 active:bg-gray-50 disabled:opacity-40"
                >
                  <RotateCcw size={16} className="text-gray-500" />
                  Start a new session
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex w-full items-center gap-3 text-sm text-gray-500 md:w-auto min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 whitespace-nowrap border-b-2 py-2 compact:py-1 max-[359px]:text-[0.75rem] md:flex-none md:border-b-0 md:py-0 ${
                activeTab === tab.key ? "border-emerald-600 font-medium text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="hidden md:contents">
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
          </span>
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
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 md:px-2.5 md:py-1 md:text-xs"
                  >
                    skip and move to the next section
                  </button>
                </div>
              )
            }
          />
          {voice.state === "speaking" && (
            <div
              className={`shrink-0 items-center justify-between gap-2 border-t border-gray-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 md:flex ${
                typeMode ? "flex" : "hidden"
              }`}
            >
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
          <div className={`shrink-0 flex-col gap-1.5 px-2 pt-2 md:flex md:p-0 ${typeMode ? "flex" : "hidden"}`}>
            <button
              type="button"
              onClick={() => setTypeMode(false)}
              className="flex min-h-11 items-center gap-1.5 self-center rounded-full bg-emerald-50 px-4 text-sm font-medium text-emerald-700 md:hidden"
            >
              <Mic size={14} />
              Use voice instead
            </button>
            <AgentChatComposer
              onSubmit={(text) => send(text)}
              disabled={pending}
              voice={voice}
              placeholder={`Talk or type your ${label.toLowerCase()} answers...`}
            />
          </div>
          <div className="hidden shrink-0 border-t border-gray-100 p-2 text-right md:block">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending || !historyLoaded}
              className="rounded-md bg-emerald-800 px-3 py-1.5 text-sm text-white hover:bg-emerald-900 disabled:opacity-50"
            >
              Generate {label}
            </button>
          </div>
          {!typeMode && (
            <div className="shrink-0 px-2 pb-2 compact:pb-1 md:hidden">
              <VoiceDock
                state={voice.state}
                error={voice.error}
                onToggleMic={voice.toggle}
                onPause={voice.toggleListening}
                onContinue={voice.toggleListening}
                onAnswerNow={handleTalkNow}
                onType={() => setTypeMode(true)}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "review" && <ReviewSaveTab lastResponse={lastResponse} sessionId={sessionId} saveNote={saveNote} label={label} />}
    </div>
  );
}
