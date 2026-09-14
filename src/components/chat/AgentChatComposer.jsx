import { useState } from "react";
import { Mic, Send, Volume2 } from "lucide-react";

// Generic chat input — deliberately separate from AiCareAssistant.jsx (that
// one is hardwired to the /ask endpoint + a caregiver-selected patient).
// Styled as its own section card (matches the rest of this app's cards)
// rather than a shell-docked bar, since it sits inline in the page instead
// of pinned to the AppShell chrome. Takes onSubmit and reflects whatever
// voice state the caller passes in from useDeepgramVoice.
export default function AgentChatComposer({ onSubmit, disabled, placeholder = "Type or tap the microphone to talk continuously.", voice }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || !input.trim()) return;
    onSubmit(input.trim());
    setInput("");
  };

  const micActive = voice?.isActive;
  const micLabel = micActive ? `Voice ${voice.state}${voice.transcript ? `: ${voice.transcript}` : ""}` : "Start voice input";

  return (
    <div className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
        />
        {voice?.playReply && voice.state === "speaking" && <Volume2 size={16} className="shrink-0 animate-pulse text-emerald-500" />}
        {voice && (
          <button
            type="button"
            onClick={voice.toggle}
            disabled={disabled}
            title={micLabel}
            aria-pressed={micActive}
            className={`shrink-0 disabled:opacity-40 ${micActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Mic size={18} />
          </button>
        )}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Send size={14} />
          Submit
        </button>
      </form>
    </div>
  );
}
