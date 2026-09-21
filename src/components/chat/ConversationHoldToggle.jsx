import { Pause, Play } from "lucide-react";

// Sits beside the Start/Stop Conversation toggle. Puts the whole voice
// session on hold in one tap: freezes the AI's reply if one is playing
// *and* mutes the mic, together — Start Now un-freezes both. Available the
// whole time the session is active, from the first AI response through the
// last, not just while a reply happens to be playing. Built on
// DeepgramVoiceSession's pauseListening()/resumeListening().
// Callers that drive it themselves pass `speaking`, `onToggle`, `showWhenIdle`.
export default function ConversationHoldToggle({ voice, speaking, onToggle, showWhenIdle = false, disabled = false }) {
  if (!voice || (!voice.isActive && !showWhenIdle)) return null;
  const held = speaking === undefined ? voice.isPaused : !speaking;
  return (
    <button
      type="button"
      onClick={onToggle || voice.toggleListening}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40 ${
        held ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
      }`}
    >
      {held ? <Play size={14} /> : <Pause size={14} />}
      {held ? "Start Now" : "Pause Now"}
    </button>
  );
}
