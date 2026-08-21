import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { HeartPulse, RotateCcw } from "lucide-react";
import useAgentChat from "../../hooks/useAgentChat";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import WellnessTrendsTab from "./WellnessTrendsTab";
import WellnessPlanTab from "./WellnessPlanTab";
import {
  wellnessChat,
  wellnessHistory,
  wellnessClear,
  wellnessAlertAction,
  wellnessDashboard,
  updateWellnessProfile,
  getWellnessVoiceToken,
} from "../../api/hospitalApi";

const KICKOFF_MESSAGE = "I would like to do my heart failure wellness check-in.";

const ZONE_STYLES = {
  green: { label: "All Clear Zone", detail: "Everything you reported today is in your usual range.", className: "bg-emerald-600" },
  yellow: { label: "Caution Zone", detail: "Something you reported today is outside your usual range.", className: "bg-amber-500" },
  red: { label: "Urgent Zone", detail: "What you reported needs prompt attention.", className: "bg-red-600" },
};

const TABS = [
  { key: "checkin", label: "Today's check-in" },
  { key: "trends", label: "My Progress" },
  { key: "plan", label: "My Baseline" },
];

function ZoneBanner({ zone }) {
  const style = ZONE_STYLES[zone];
  if (!style) return null;
  return (
    <div className={`mx-2 mt-2 flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white ${style.className}`}>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25">✓</span>
      <span className="font-semibold">{style.label}</span>
      <span className="font-normal opacity-90">— {style.detail}</span>
    </div>
  );
}

function HandoffPanel({ alert, onAction }) {
  if (!alert) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
      <span className="font-medium">{alert.message || "This may need prompt attention."}</span>
      <div className="ml-auto flex gap-2">
        <a href="tel:911" className="rounded-md bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700">
          Call 911
        </a>
        <button
          type="button"
          onClick={() => onAction(alert.id, "handed_off")}
          className="rounded-md bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700"
        >
          Request urgent visit
        </button>
        <button
          type="button"
          onClick={() => onAction(alert.id, "dismissed")}
          className="rounded-md border border-amber-300 px-2 py-1 font-medium text-amber-700 hover:bg-amber-100"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

export default function WellnessCheckInPanel() {
  const [activeTab, setActiveTab] = useState("checkin");
  const { setAssistantHidden } = useOutletContext() || {};

  // This panel has its own composer (below) instead of the shared
  // AiCareAssistant docked bar — hide that bar while it's mounted.
  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  const { turns, lastResponse, pending, error, send, hydrateHistory, historyLoaded, reset } = useAgentChat({
    sendMessage: wellnessChat,
    loadHistory: wellnessHistory,
    clearSession: wellnessClear,
  });

  // Feeds both My Progress (stats/chart/check-in list) and My Baseline's
  // prefill (dashboard.profile) — one GET /dashboard call, same as legacy's
  // loadDashboard(), which also calls fillPlanForm(currentProfile) from it.
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const refreshDashboard = () => {
    setDashboardLoading(true);
    wellnessDashboard()
      .then((data) => {
        setDashboard(data);
        setDashboardError(null);
      })
      .catch((err) => setDashboardError(err?.message || "Could not load your wellness data"))
      .finally(() => setDashboardLoading(false));
  };

  const voice = useDeepgramVoice({
    fetchToken: getWellnessVoiceToken,
    onUtterance: (text) => send(text, { source: "voice", include_audio: true }),
  });

  useEffect(() => {
    hydrateHistory().then((res) => {
      if (!res?.chat_history?.length) send(KICKOFF_MESSAGE);
    });
    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play back the assistant's spoken reply when the turn came from voice input.
  // Quietly refresh My Trends/My Plan data whenever a turn records a check-in,
  // matching legacy's "reloads dashboard quietly if check_in was recorded".
  useEffect(() => {
    if (lastResponse?.audio_base64) {
      voice.playReply(lastResponse.audio_base64, lastResponse.audio_content_type).then(() => voice.resumeAfterTurn());
    }
    if (lastResponse?.check_in) refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  const handleAlertAction = (alertId, status) => {
    // TODO(Phase 3): "handed_off" should hand off into Book Appointment's
    // chat, prefilled from this alert — same cross-feature link the legacy
    // backend already wires (escalation.py).
    wellnessAlertAction(alertId, { status }).catch(() => {});
  };

  const handleStartOver = async () => {
    if (pending) return;
    if (voice.isActive) voice.stop();
    await reset();
    send(KICKOFF_MESSAGE);
  };

  const handleSaveProfile = async (form) => {
    await updateWellnessProfile(form);
    refreshDashboard();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Same section-card header bar as ConversationCard.jsx: bg-[#F0FDF4],
          border-b border-gray-100, tabs styled font-medium text-emerald-600
          when active. */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <HeartPulse size={14} className="text-emerald-600" />
            Heart Wellness Check-in
          </h3>
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
            {activeTab === "checkin" && (
              <button
                type="button"
                onClick={handleStartOver}
                disabled={pending}
                title="Clear this conversation and start a new check-in"
                className="flex items-center gap-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={12} />
                Start New Session
              </button>
            )}
          </div>
        </div>

        {activeTab === "checkin" && (
          <>
            <ZoneBanner zone={lastResponse?.zone} />
            <AgentChatThread
              bare
              turns={turns}
              pending={pending || !historyLoaded}
              error={error}
              quickReplies={lastResponse?.follow_up_question?.options}
              onQuickReply={(option) => send(option)}
              emptyState="Loading your check-in..."
              renderExtra={(meta) => <HandoffPanel alert={meta?.handoff ? meta.alert : null} onAction={handleAlertAction} />}
            />
          </>
        )}

        {activeTab === "trends" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <WellnessTrendsTab dashboard={dashboard} loading={dashboardLoading} error={dashboardError} />
          </div>
        )}

        {activeTab === "plan" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <WellnessPlanTab profile={dashboard?.profile} onSave={handleSaveProfile} />
          </div>
        )}
      </div>

      {activeTab === "checkin" && (
        <AgentChatComposer
          onSubmit={(text) => send(text)}
          disabled={pending}
          placeholder="Tell me your morning weight and how you are feeling. Type, or tap the microphone to talk continuously."
          voice={voice}
        />
      )}
    </div>
  );
}
