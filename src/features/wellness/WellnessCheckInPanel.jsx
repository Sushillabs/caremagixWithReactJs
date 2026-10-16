import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronDown, EllipsisVertical, HeartPulse, Mic, RotateCcw } from "lucide-react";
import useAgentChat from "../../hooks/useAgentChat";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import useVoiceTurnLock from "../../hooks/useVoiceTurnLock";
import useStopVoiceOnAuthError from "../../hooks/useStopVoiceOnAuthError";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import VoiceStartGate from "../../components/chat/VoiceStartGate";
import VoiceToggleButton from "../../components/chat/VoiceToggleButton";
import ConversationHoldToggle from "../../components/chat/ConversationHoldToggle";
import VoiceDock from "../../components/chat/VoiceDock";
import WellnessTrendsTab from "./WellnessTrendsTab";
import {
  wellnessChat,
  wellnessHistory,
  wellnessClear,
  wellnessAlertAction,
  wellnessDashboard,
  getWellnessVoiceToken,
  wellnessSpeakStream,
  wellnessSpeakBase64,
} from "../../api/hospitalApi";

const KICKOFF_MESSAGE = "I would like to do my wellness check-in.";

const ZONE_STYLES = {
  green: { label: "All Clear Zone", detail: "Everything you reported today is in your usual range.", className: "bg-emerald-600" },
  yellow: { label: "Caution Zone", detail: "Something you reported today is outside your usual range.", className: "bg-amber-500" },
  red: { label: "Urgent Zone", detail: "What you reported needs prompt attention.", className: "bg-red-600" },
};

const TABS = [
  { key: "checkin", label: "Today's check-in" },
  { key: "trends", label: "My Progress" },
];

function ZoneBanner({ zone }) {
  const style = ZONE_STYLES[zone];
  if (!style) return null;
  return (
    <div className={`mx-2 mt-2 flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white ${style.className}`}>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25">✓</span>
      <span className="font-semibold">{style.label}</span>
      <span className="hidden font-normal opacity-90 md:inline">— {style.detail}</span>
    </div>
  );
}

// Friendly short label for a known check-in column; anything else falls back
// to a humanized field_key or a trimmed prompt (see questionLabel).
const FIELD_LABELS = {
  weight_lb: "Weight",
  systolic_bp: "Systolic BP",
  diastolic_bp: "Diastolic BP",
  heart_rate: "Heart rate",
  spo2: "SpO2",
  breathlessness: "Breathing",
  orthopnea_pillows: "Pillows to sleep",
  swelling: "Swelling",
  chest_pain: "Chest pain",
  cough: "Cough",
  fatigue: "Fatigue",
  dizziness: "Dizziness",
  confusion: "Confusion",
  fainting: "Fainting",
  appetite_loss: "Appetite",
  palpitations: "Palpitations",
  fluid_intake_ml: "Fluid intake",
  sodium_estimate_mg: "Sodium",
  activity_minutes: "Activity",
  sleep_hours: "Sleep",
  mood: "Mood",
  medications_taken: "Medications",
  missed_medications: "Missed meds",
};

function questionLabel(q) {
  if (q.field_key && FIELD_LABELS[q.field_key]) return FIELD_LABELS[q.field_key];
  if (q.field_key) {
    return q.field_key
      .replace(/_(lb|ml|mg|bp)$/i, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const text = (q.prompt || "").trim();
  return text.length > 28 ? `${text.slice(0, 27)}…` : text || "Question";
}

// A question counts as answered when its mapped check-in column has a value,
// or the agent stored the answer in custom_answers (keyed by id or field_key).
function isQuestionAnswered(q, checkIn) {
  if (!checkIn) return false;
  const filled = (v) => v != null && v !== "";
  if (q.field_key && filled(checkIn[q.field_key])) return true;
  const custom = checkIn.custom_answers || {};
  return filled(custom[q.id]) || (q.field_key ? filled(custom[q.field_key]) : false);
}

const MAX_PROGRESS_CHIPS = 8;

// Progress strip beside the chat, driven by the patient's diagnosis-based
// question list (dashboard.questions.questions) — no hard-coded HF fields.
// Tracks all active questions ("N of M answered"); core questions get a * so
// the patient knows which the coach chases first.
function ProgressChecklist({ questions, checkIn }) {
  const [expanded, setExpanded] = useState(false);
  const list = Array.isArray(questions) ? [...questions].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) : [];
  if (!list.length) return null;

  const answeredCount = list.filter((q) => isQuestionAnswered(q, checkIn)).length;
  const shown = list.slice(0, MAX_PROGRESS_CHIPS);
  const hidden = list.length - shown.length;

  return (
    <div className="mx-2 mt-2 flex shrink-0 flex-wrap items-center gap-3 text-[11px]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600 md:hidden"
      >
        {answeredCount} of {list.length} answered
        <ChevronDown size={12} className={expanded ? "rotate-180" : ""} />
      </button>
      <span className="hidden font-medium text-gray-500 md:inline">
        {answeredCount} of {list.length} answered
      </span>
      {shown.map((q) => {
        const done = isQuestionAnswered(q, checkIn);
        return (
          <span
            key={q.id}
            title={`${q.prompt || questionLabel(q)}${q.is_core ? " (core)" : ""}`}
            className={`items-center gap-1 md:flex ${expanded ? "flex" : "hidden"} ${done ? "text-emerald-600" : "text-gray-400"}`}
          >
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${done ? "bg-emerald-100" : "bg-gray-100"}`}>
              {done ? "✓" : "○"}
            </span>
            {questionLabel(q)}
            {q.is_core && <span className="text-amber-500">*</span>}
          </span>
        );
      })}
      {hidden > 0 && <span className={`text-gray-400 md:inline ${expanded ? "inline" : "hidden"}`}>+{hidden} more</span>}
    </div>
  );
}

function CompletionBanner() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">✓</span>
      <span className="font-medium">Check-in complete for today.</span>
      <span className="text-emerald-600">You can keep chatting if you'd like to add anything else.</span>
    </div>
  );
}

function HandoffPanel({ message, onRequestVisit, onDismiss }) {
  return (
    <div className="shrink-0 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
      <span className="font-medium">{message || "This may need prompt attention."}</span>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={onRequestVisit} className="rounded-md bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700">
          Request urgent visit
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-amber-300 px-2 py-1 font-medium text-amber-700 hover:bg-amber-100"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// initialTab: which TABS key to land on — set by PatientDetails from ?tab=
// (e.g. the dashboard's Wellness Streak card links straight to "trends").
// Falls back to the default "checkin" tab for anything else, including no prop at all.
export default function WellnessCheckInPanel({ initialTab, onRequestVisit }) {
  const [activeTab, setActiveTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : "checkin");
  // Gates the checkin tab's chat behind a tap-to-start mic screen, same
  // pattern as VisitNotesAI — Trends/Baseline stay independent, fed by their
  // own dashboard fetch below, not blocked by this.
  const [started, setStarted] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [checklistCleared, setChecklistCleared] = useState(false);
  const [typeMode, setTypeMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setAssistantHidden } = useOutletContext() || {};

  // This panel has its own composer (below) instead of the shared
  // AiCareAssistant docked bar — hide that bar while it's mounted.
  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  const { turns, lastResponse, pending, error, errorStatus, send, hydrateHistory, historyLoaded, reset } = useAgentChat({
    sendMessage: wellnessChat,
    loadHistory: wellnessHistory,
    clearSession: wellnessClear,
  });

  // Feeds My Progress (stats/chart/check-in list) — plan editing moved to
  // the caregiver side, so dashboard.profile is no longer used here.
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [authExpired, setAuthExpired] = useState(false);

  const dashboardReqRef = useRef(0);

  const refreshDashboard = () => {
    const reqId = ++dashboardReqRef.current;
    setDashboardLoading(true);
    return wellnessDashboard()
      .then((data) => {
        if (reqId !== dashboardReqRef.current) return data;
        setDashboard(data);
        setDashboardError(null);
        return data;
      })
      .catch((err) => {
        if (reqId !== dashboardReqRef.current) return;
        if (err?.response?.status === 401) setAuthExpired(true);
        setDashboardError(err?.message || "Could not load your wellness data");
      })
      .finally(() => {
        if (reqId === dashboardReqRef.current) setDashboardLoading(false);
      });
  };

  const voice = useDeepgramVoice({
    fetchToken: getWellnessVoiceToken,
    onUtterance: (text) => send(text, { source: "voice" }),
  });
  const pendingRef = useVoiceTurnLock(voice, { pending, error });
  const micOnRef = useRef(false);
  micOnRef.current = voice.isActive;

  // Streams the reply's audio as it's generated, falling back to a plain
  // base64 clip on genuine failure (not on a user-triggered interrupt).
  // Replies stay text-only while the check-in is stopped.
  const speakAbortRef = useRef(null);
  const abortSpeech = useCallback(() => speakAbortRef.current?.abort(), []);
  const speak = async (text, { force = false } = {}) => {
    if (!text || (!force && !micOnRef.current)) return;
    const controller = new AbortController();
    speakAbortRef.current = controller;
    try {
      const res = await wellnessSpeakStream(text, controller.signal);
      if (!res.ok || !res.body) throw new Error("stream failed");
      if (!force && !micOnRef.current) return;
      await voice.playStream(res);
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          const data = await wellnessSpeakBase64(text);
          if (data?.audio_base64 && (force || micOnRef.current)) await voice.playReply(data.audio_base64, data.audio_content_type);
        } catch {
          /* text is already shown either way — give up on audio silently */
        }
      }
    } finally {
      if (speakAbortRef.current === controller) speakAbortRef.current = null;
      if (!pendingRef.current) voice.resumeAfterTurn();
    }
  };

  useStopVoiceOnAuthError(voice, [errorStatus, authExpired], abortSpeech);

  const handleTalkNow = () => {
    abortSpeech();
    voice.interruptSpeech();
  };

  useEffect(() => {
    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    setStarted(true);
    await hydrateHistory();
  };

  const lastAssistantText = [...turns].reverse().find((t) => t.role === "assistant" && typeof t.content === "string")?.content;

  const beginCheckIn = () => {
    setConversationStarted(true);
    voice.start()?.catch(() => {});
    if (turns.length) speak(lastAssistantText, { force: true });
    else send(KICKOFF_MESSAGE);
  };

  const stopCheckIn = () => {
    speakAbortRef.current?.abort();
    voice.stop();
  };

  const toggleCheckIn = () => (voice.isActive ? stopCheckIn() : beginCheckIn());

  const handleHoldToggle = () => {
    if (voice.isActive) {
      if (voice.isPaused) voice.resumeListening();
      else voice.pauseListening();
    } else {
      voice.start()?.catch(() => {});
      speak(lastAssistantText, { force: true });
    }
  };

  // Speak the assistant's reply when the turn came from voice input.
  // Quietly refresh My Progress whenever a turn records a check-in, matching
  // legacy's "reloads dashboard quietly if check_in was recorded".
  useEffect(() => {
    if (lastResponse?.message) speak(lastResponse.message);
    else if (lastResponse) voice.resumeAfterTurn();
    const alertMayChange = lastResponse?.zone === "red" || lastResponse?.zone === "yellow" || !!lastResponse?.alert;
    if (lastResponse?.check_in || alertMayChange) refreshDashboard();
    // The zone (and so the offer) is decided by the backend from the
    // clinician's yellow/red answers — the card only mirrors what it sends.
    // const handoff = lastResponse?.appointment_handoff;
    // if (handoff) setActiveHandoff(handoff);
    // if (lastResponse?.alert?.id) setActiveAlertId(lastResponse.alert.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  const [activeHandoff, setActiveHandoff] = useState(null);

  const activeAlert = dashboard?.open_alerts?.[0] || null;
  const activeAlertId = activeAlert?.id || null;
  const showHandoff = !!activeAlertId;

  useEffect(() => {
    const dashHandoff = dashboard?.appointment_handoff;
    if (dashHandoff) setActiveHandoff((h) => h || dashHandoff);
  }, [dashboard]);

  const closeHandoff = (status) => {
    setActiveHandoff(null);
    if (!activeAlertId) return;
    wellnessAlertAction(activeAlertId, { status })
      .then(() => refreshDashboard())
      .catch(() => {});
  };

  const handleRequestVisit = () => {
    closeHandoff("handed_off");
    speakAbortRef.current?.abort();
    if (voice.isActive) voice.stop();
    onRequestVisit?.();
  };

  const handleStartOver = async () => {
    if (pending) return;
    speakAbortRef.current?.abort();
    setConversationStarted(true);
    setChecklistCleared(true);
    setActiveHandoff(null);
    dashboardReqRef.current += 1;
    setDashboard((d) => (d ? { ...d, open_alerts: [], appointment_handoff: undefined } : d));
    if (voice.isActive) voice.stop();
    await reset();
    voice.start()?.catch(() => {});
    // reset() clears historyLoaded back to false, and AgentChatThread's
    // pending indicator is `pending || !historyLoaded` — without
    // re-hydrating here it stays stuck showing "Thinking" forever, even
    // after the kickoff response lands (matches VisitNotesAI's
    // handleStartOver, which does the same reset -> hydrateHistory -> send).
    await hydrateHistory();
    send(KICKOFF_MESSAGE);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 short:min-h-80">
      {/* Same section-card header bar as ConversationCard.jsx: bg-[#F0FDF4],
          border-b border-gray-100, tabs styled font-medium text-emerald-600
          when active. */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-gray-100 p-2 pb-0 bg-[#F0FDF4] compact:gap-y-0 compact:pt-1 md:gap-2 md:pb-2">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <HeartPulse size={14} className="text-emerald-600" />
            Wellness Check-in
          </h3>
          {activeTab === "checkin" && started && (
            <div className="relative ml-auto md:hidden">
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
          )}
          <div className="flex w-full items-center gap-3 text-sm text-gray-500 md:w-auto min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 whitespace-nowrap border-b-2 py-2 compact:py-1 md:flex-none md:border-b-0 md:py-0 ${
                  activeTab === tab.key ? "border-emerald-600 font-medium text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {activeTab === "checkin" && started && (
              <span className="hidden md:contents">
                {!voice.isPaused && (
                  <VoiceToggleButton
                    voice={voice}
                    startLabel={conversationStarted ? "Mic Off" : "Start Wellness Check-in"}
                    stopLabel="Mic On"
                    onToggle={toggleCheckIn}
                    disabled={!historyLoaded}
                  />
                )}
                {conversationStarted && (
                  <ConversationHoldToggle voice={voice} showWhenIdle speaking={voice.isActive && !voice.isPaused} onToggle={handleHoldToggle} />
                )}
                <button
                  type="button"
                  onClick={handleStartOver}
                  disabled={pending}
                  title="Clear this conversation and start a new check-in"
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={12} />
                  Start a New Session
                </button>
              </span>
            )}
          </div>
        </div>

        {activeTab === "checkin" &&
          (started ? (
            <>
              <ZoneBanner zone={lastResponse?.zone} />
              <ProgressChecklist
                questions={dashboard?.questions?.questions}
                checkIn={lastResponse?.check_in || (!checklistCleared && dashboard?.checked_in_today ? dashboard?.latest_check_in : null)}
              />
              {showHandoff && (
                <div className="mx-2 mt-2">
                  <HandoffPanel message={activeAlert?.message} onRequestVisit={handleRequestVisit} onDismiss={() => closeHandoff("dismissed")} />
                </div>
              )}
              <AgentChatThread
                bare
                turns={turns}
                pending={pending || !historyLoaded}
                error={error}
                quickReplies={lastResponse?.follow_up_question?.options}
                onQuickReply={(option) => send(option)}
                emptyState="Tap Start Wellness Check-in to begin."
                liveText={voice.transcript}
                renderExtra={(meta) => meta?.status === "check_in_complete" && <CompletionBanner />}
              />
            </>
          ) : (
            <VoiceStartGate label="Talk to your Wellness Check-in" onStart={handleStart} />
          ))}

        {activeTab === "trends" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <WellnessTrendsTab dashboard={dashboard} loading={dashboardLoading} error={dashboardError} />
          </div>
        )}
      </div>

      {activeTab === "checkin" && started && voice.state === "speaking" && (
        <div
          className={`shrink-0 items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 md:flex ${
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

      {activeTab === "checkin" && started && !typeMode && (
        <VoiceDock
          state={voice.state}
          error={voice.error}
          idleHint={conversationStarted ? "Mic is off. Tap the mic to talk." : "Tap the mic to start your check-in"}
          onToggleMic={toggleCheckIn}
          micDisabled={!historyLoaded}
          onPause={conversationStarted ? handleHoldToggle : undefined}
          onContinue={handleHoldToggle}
          onAnswerNow={handleTalkNow}
          onType={() => setTypeMode(true)}
        />
      )}

      {activeTab === "checkin" && started && (
        <div className={`shrink-0 flex-col gap-1.5 md:flex ${typeMode ? "flex" : "hidden"}`}>
          <button
            type="button"
            onClick={() => setTypeMode(false)}
            className="flex items-center gap-1 self-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:hidden"
          >
            <Mic size={14} />
            Use voice instead
          </button>
          <AgentChatComposer
            onSubmit={(text) => send(text)}
            disabled={pending}
            placeholder="Tell me your morning weight and how you are feeling. Type, or tap the microphone to talk continuously."
            voice={voice.isPaused ? null : voice}
            onMicToggle={toggleCheckIn}
          />
        </div>
      )}
    </div>
  );
}
