import { Mic, MicOff } from "lucide-react";

// Header pill toggle for a voice session — the same "Start Conversation"/"Stop Conversation"
// control VisitNotesAI introduced in its header bar, pulled out so every
// voice-first feature shares one implementation. Takes the object returned
// by useDeepgramVoice directly.
export default function VoiceToggleButton({
  voice,
  startLabel = "Start Conversation",
  stopLabel = "Stop Conversation",
  onToggle,
  disabled = false,
}) {
  if (!voice) return null;
  return (
    <button
      type="button"
      onClick={onToggle || voice.toggle}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40 ${
        voice.isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {voice.isActive ? <Mic size={14} /> : <MicOff size={14} />}
      {voice.isActive ? stopLabel : startLabel}
    </button>
  );
}
