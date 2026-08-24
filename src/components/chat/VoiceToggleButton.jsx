import { Mic, MicOff } from "lucide-react";

// Header pill toggle for a voice session — the same "Start Mic"/"Stop Mic"
// control VisitNotesAI introduced in its header bar, pulled out so every
// voice-first feature shares one implementation. Takes the object returned
// by useDeepgramVoice directly.
export default function VoiceToggleButton({ voice }) {
  if (!voice) return null;
  return (
    <button
      type="button"
      onClick={voice.toggle}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-white ${
        voice.isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {voice.isActive ? <Mic size={14} /> : <MicOff size={14} />}
      {voice.isActive ? "Stop Mic" : "Start Mic"}
    </button>
  );
}
