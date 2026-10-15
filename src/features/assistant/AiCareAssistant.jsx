import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Sparkles, Mic, Send } from "lucide-react";
import useAskQuestion from "../../hooks/useAskQuestion";
import useMediaQuery from "../../hooks/useMediaQuery";

export default function AiCareAssistant() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const { askQuestion, isPending } = useAskQuestion();
  const patient = useSelector((state) => state.patientsingledata?.value);
  // const conversation = useSelector((state) => state.askQ?.value) || [];

  const isMd = useMediaQuery("(min-width: 768px)");
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef(null);
  const chatActive = focused || isListening;

  const handleFocus = () => {
    clearTimeout(blurTimerRef.current);
    setFocused(true);
  };
  // Delay so the tap that caused the blur lands before the action row reappears and shifts the layout.
  const handleBlur = () => {
    clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => setFocused(false), 250);
  };

  useEffect(() => () => clearTimeout(blurTimerRef.current), []);

  useEffect(() => {
    const root = document.documentElement;
    if (chatActive) root.setAttribute("data-chat-active", "");
    else root.removeAttribute("data-chat-active");
    return () => root.removeAttribute("data-chat-active");
  }, [chatActive]);
  const hasPatient = Boolean(patient);
  const patientName = patient?.patient_name || patient?.patient?.name;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasPatient || !input.trim() || isPending) return;
    askQuestion(input.trim());
    setInput("");
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="border-t border-gray-200 bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-5 md:py-3">
      <div className="mb-2 hidden items-center justify-between md:tall:flex">
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

      {isListening && (
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 md:hidden" role="status">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-800">Listening…</p>
            <p className="text-xs text-emerald-700">Speak now. Tap the mic when done.</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 md:rounded-lg md:px-3 md:py-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={!hasPatient || isPending}
          placeholder={hasPatient ? (isMd ? "Ask anything about patient care..." : "Ask about this patient") : "Select a patient to start"}
          className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={!hasPatient || isPending}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40 md:h-auto md:w-auto md:rounded-none md:bg-transparent md:hover:text-gray-600 ${
            isListening ? "animate-pulse bg-red-500 md:text-red-500" : "bg-emerald-600 md:text-gray-400"
          }`}
          aria-label="Voice input"
          aria-pressed={isListening}
        >
          <Mic size={18} className="size-[22px] md:size-[18px]" />
        </button>
        <button
          type="submit"
          disabled={!hasPatient || isPending || !input.trim()}
          aria-label="Submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center gap-1 rounded-full bg-gray-800 text-sm text-white disabled:opacity-30 md:h-auto md:bg-emerald-600 md:hover:bg-emerald-700 md:disabled:opacity-40 md:w-auto md:px-3 md:py-1.5"
        >
          <Send size={14} className="size-[18px] md:size-[14px]" />
          <span className="hidden md:inline">{isPending ? "..." : "Submit"}</span>
        </button>
      </form>
      <p className="mt-1.5 text-center text-[11px] text-gray-400 md:tall:hidden">AI answers can be wrong. Check clinical info.</p>
    </div>
  );
}
