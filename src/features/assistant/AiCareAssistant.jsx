import { useState } from "react";
import { useSelector } from "react-redux";
import { Sparkles, Mic, Send } from "lucide-react";
import useAskQuestion from "../../hooks/useAskQuestion";

export default function AiCareAssistant() {
  const [input, setInput] = useState("");
  const { askQuestion, isPending } = useAskQuestion();
  const patient = useSelector((state) => state.patientsingledata?.value);
  // const conversation = useSelector((state) => state.askQ?.value) || [];

  const hasPatient = Boolean(patient);
  const patientName = patient?.patient_name || patient?.patient?.name;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasPatient || !input.trim() || isPending) return;
    askQuestion(input.trim());
    setInput("");
  };

  return (
    <div className="border-t border-gray-200 bg-white px-5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Sparkles size={16} className="text-emerald-500" />
          AI Care Assistant
          {patientName && <span className="text-xs font-normal text-gray-400">· {patientName}</span>}
        </div>
        <span className="text-[11px] text-gray-400">AI responses are model-generated. Verify with relevant clinical information.</span>
      </div>

      {/* {conversation.length > 0 && (
        <div className="mb-2 max-h-40 space-y-2 overflow-y-auto rounded-md bg-gray-50 p-3 text-sm">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={msg.role === "user" ? "text-gray-800" : "text-emerald-700"}
            >
              <span className="font-medium capitalize">{msg.role}: </span>
              {typeof msg.content === "string" ? msg.content : ""}
            </div>
          ))}
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!hasPatient || isPending}
          placeholder={hasPatient ? "Ask anything about patient care..." : "Select a patient to start"}
          className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={!hasPatient || isPending}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
          aria-label="Voice input"
        >
          <Mic size={18} />
        </button>
        <button
          type="submit"
          disabled={!hasPatient || isPending || !input.trim()}
          className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Send size={14} />
          {isPending ? "..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
