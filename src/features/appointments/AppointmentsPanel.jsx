import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarPlus, RotateCcw } from "lucide-react";
import useAgentChat from "../../hooks/useAgentChat";
import useDeepgramVoice from "../../hooks/useDeepgramVoice";
import AgentChatThread from "../../components/chat/AgentChatThread";
import AgentChatComposer from "../../components/chat/AgentChatComposer";
import VoiceStartGate from "../../components/chat/VoiceStartGate";
import VoiceToggleButton from "../../components/chat/VoiceToggleButton";
import MyAppointmentsTab from "./MyAppointmentsTab";
import {
  appointmentChat,
  appointmentHistory,
  appointmentClear,
  appointmentConfirm,
  getAppointmentPhysicians,
  getAppointmentVoiceToken,
  appointmentSpeakStream,
  appointmentSpeakBase64,
} from "../../api/hospitalApi";

const KICKOFF_MESSAGE = "I would like to schedule a physician appointment.";

const TABS = [
  { key: "book", label: "Book Appointment" },
  { key: "myAppointments", label: "My Appointments" },
];

function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Matches legacy's physicianOptionLabel() exactly, so the same text the agent
// puts in follow_up_question.options can be resolved back to a physician_id.
function physicianLabel(p) {
  let label = p.full_name || "Physician";
  if (p.hospital_name) label += ` — ${p.hospital_name}`;
  if (p.distance_label) label += ` (${p.distance_label})`;
  return label;
}

function ConfirmBookingPanel({ booking, pending, onConfirm }) {
  if (!booking) return null;
  return (
    <div className="mt-2 space-y-1 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
      <p>
        <span className="font-medium">Physician:</span> {booking.physician_name}
      </p>
      <p>
        <span className="font-medium">When:</span> {formatDateTime(booking.appointment_datetime)}
      </p>
      <p>
        <span className="font-medium">Type:</span> {booking.appointment_type}
      </p>
      {booking.reason && (
        <p>
          <span className="font-medium">Reason:</span> {booking.reason}
        </p>
      )}
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className="mt-1 rounded-md bg-emerald-600 px-3 py-1 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirm booking
      </button>
    </div>
  );
}

// initialTab: which TABS key to land on — set by PatientDetails from ?tab=
// (e.g. the dashboard's Your Appointments card links straight to "myAppointments"
// instead of the booking chat). Falls back to the default "book" tab otherwise.
export default function AppointmentsPanel({ initialTab }) {
  const [activeTab, setActiveTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : "book");
  // Gates the Book Appointment tab's chat behind a tap-to-start mic screen,
  // same pattern as VisitNotesAI/Wellness — My Appointments stays
  // independent, not blocked by this.
  const [started, setStarted] = useState(false);
  const { setAssistantHidden } = useOutletContext() || {};

  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  // No hydrateHistory/historyLoaded here — unlike Wellness, legacy's booking
  // flow (patient_appointment.js) never calls GET /physician-appointment/history
  // at all. Every open/"New chat" is always a clean slate (resetChatSession()
  // + sendChatMessage() directly), so there's no prior session to resume.
  const { sessionId, turns, lastResponse, pending, error, send, runAction, reset } = useAgentChat({
    sendMessage: appointmentChat,
    loadHistory: appointmentHistory,
    clearSession: appointmentClear,
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [physicians, setPhysicians] = useState([]);
  // True when the patient has no pre-matched physician yet — mirrors
  // legacy's default dropdown option text ("Select nearest physician…" vs
  // "Use assigned physician").
  const [physicianSelectionRequired, setPhysicianSelectionRequired] = useState(false);

  const [selectedPhysicianId, setSelectedPhysicianId] = useState(null);

  useEffect(() => {
    getAppointmentPhysicians()
      .then((data) => {
        const list = data?.physicians || [];
        setPhysicians(list);
        setPhysicianSelectionRequired(!!data?.physician_selection_required);
        if (!data?.physician_selection_required) {
          const matched = list.find((p) => p.is_matched);
          if (matched) setSelectedPhysicianId(matched.user_id);
        }
      })
      .catch(() => {});
  }, []);

  // Explicit dropdown pick — same as clicking a physician quick-reply, but
  // available upfront instead of waiting for the agent to ask. Matches
  // legacy: picking one mid-session immediately nudges the agent so it
  // rebuilds available_slots for that physician right away.
  const handlePhysicianSelectChange = (e) => {
    const physicianId = e.target.value || null;
    setSelectedPhysicianId(physicianId);
    if (physicianId && sessionId) {
      sendMessage("I would like to book with the selected physician.", { physician_user_id: physicianId });
    }
  };

  const resolvePhysicianFromOption = useCallback(
    (optionText) => {
      const text = String(optionText || "").toLowerCase();
      for (const p of physicians) {
        const fullName = (p.full_name || "").toLowerCase();
        const label = physicianLabel(p).toLowerCase();
        if (text.includes(fullName) || label.includes(text) || text.includes(label)) return p.user_id;
      }
      return null;
    },
    [physicians]
  );

  const sendMessage = useCallback(
    (text, extraOpts = {}) => {
      const opts = selectedPhysicianId ? { physician_user_id: selectedPhysicianId, ...extraOpts } : extraOpts;
      return send(text, opts);
    },
    [send, selectedPhysicianId]
  );

  const voice = useDeepgramVoice({
    fetchToken: getAppointmentVoiceToken,
    onUtterance: (text) => sendMessage(text, { source: "voice" }),
  });

  // Streams the reply's audio as it's generated, falling back to a plain
  // base64 clip on genuine failure (not on a user-triggered interrupt).
  const speakAbortRef = useRef(null);
  const speak = async (text) => {
    if (!text) return;
    const controller = new AbortController();
    speakAbortRef.current = controller;
    try {
      const res = await appointmentSpeakStream(text, controller.signal);
      if (!res.ok || !res.body) throw new Error("stream failed");
      await voice.playStream(res);
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          const data = await appointmentSpeakBase64(text);
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

  const handleStart = () => {
    setStarted(true);
    sendMessage(KICKOFF_MESSAGE);
  };

  // Speak the assistant's reply when a new turn lands.
  useEffect(() => {
    if (lastResponse?.message) speak(lastResponse.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  const handleConfirmBooking = async () => {
    if (pending || bookingConfirmed || !sessionId) return;
    try {
      await runAction(() => appointmentConfirm({ session_id: sessionId }));
      setBookingConfirmed(true);
    } catch {
      // error already captured by useAgentChat's error state
    }
  };

  const handleStartOver = async () => {
    if (pending) return;
    if (voice.isActive) voice.stop();
    await reset();
    setBookingConfirmed(false);
    setSelectedPhysicianId(null);
    sendMessage(KICKOFF_MESSAGE, { physician_user_id: undefined });
  };

  const suggestedSlots = lastResponse?.suggested_slots || [];
  const slotLabels = suggestedSlots.map((slot) => slot.label || slot.datetime);
  const followUpOptions = lastResponse?.follow_up_question?.options || [];
  const isSlotTurn = slotLabels.length > 0;
  const quickReplies = isSlotTurn ? slotLabels : followUpOptions;

  const handleQuickReply = (option) => {
    const physicianId = resolvePhysicianFromOption(option);
    if (physicianId && physicianId !== selectedPhysicianId) setSelectedPhysicianId(physicianId);
    // Slot buttons send "I'd like <time>" for clearer agent parsing, matching
    // legacy's renderSlots — plain follow-up options are sent as-is.
    const text = isSlotTurn ? `I'd like ${option}` : option;
    sendMessage(text, physicianId ? { physician_user_id: physicianId } : {});
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <CalendarPlus size={14} className="text-emerald-600" />
            Appointments
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
            {activeTab === "book" && started && (
              <>
                <VoiceToggleButton voice={voice} />
                <button
                  type="button"
                  onClick={handleStartOver}
                  disabled={pending}
                  title="Clear this conversation and start a new booking request"
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={12} />
                  Start New Session
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === "book" && !started && <VoiceStartGate label="Book via Caremagix AI Assistant" onStart={handleStart} />}

        {activeTab === "book" && started && (
          <>
            <div className="shrink-0 border-b border-gray-100 p-2">
              <select
                value={selectedPhysicianId || ""}
                onChange={handlePhysicianSelectChange}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
              >
                <option value="">{physicianSelectionRequired ? "Select nearest physician…" : "Use assigned physician"}</option>
                {physicians.map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {physicianLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            <AgentChatThread
              bare
              turns={turns}
              pending={pending}
              error={error}
              quickReplies={quickReplies}
              onQuickReply={handleQuickReply}
              emptyState="Starting your appointment request..."
              liveText={voice.transcript}
              renderExtra={(meta) =>
                meta?.status === "ready_to_book" && !bookingConfirmed ? (
                  <ConfirmBookingPanel booking={meta.proposed_booking} pending={pending} onConfirm={handleConfirmBooking} />
                ) : null
              }
            />
          </>
        )}

        {activeTab === "myAppointments" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <MyAppointmentsTab />
          </div>
        )}
      </div>

      {activeTab === "book" && started && voice.state === "speaking" && (
        <div className="shrink-0 flex items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
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

      {activeTab === "book" && started && (
        <AgentChatComposer
          onSubmit={(text) => sendMessage(text)}
          disabled={pending}
          placeholder="Tell me what kind of visit you need and when. Type, or tap the microphone to talk continuously."
          voice={voice}
        />
      )}
    </div>
  );
}
