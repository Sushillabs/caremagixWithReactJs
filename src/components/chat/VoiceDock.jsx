import { useEffect, useRef, useState } from "react";
import { Hand, Keyboard, Mic, Pause, Play } from "lucide-react";

const STATUS = {
  idle: null,
  connecting: { title: "Connecting…", text: "", tone: "bg-emerald-50 text-emerald-800" },
  listening: { title: "Listening…", text: "speak now", tone: "bg-emerald-50 text-emerald-800" },
  thinking: { title: "Thinking…", text: "", tone: "bg-emerald-50 text-emerald-800" },
  speaking: { title: "AI is speaking…", text: "", tone: "bg-white text-gray-700" },
  paused: { title: "Paused", text: "", tone: "bg-amber-50 text-amber-800" },
};

function friendlyError(error) {
  if (/permission|not ?allowed/i.test(error)) return "Microphone is blocked. Allow mic access in your browser settings, or tap Type.";
  return error;
}

function SideButton({ icon, label, onClick, disabled }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex w-16 flex-col items-center gap-1 text-[11px] text-gray-600 disabled:opacity-40"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 short:h-10 short:w-10">
        <Icon size={20} />
      </span>
      <span className="short:hidden">{label}</span>
    </button>
  );
}

export default function VoiceDock({ state = "idle", idleHint = "Tap the mic to talk", error, onToggleMic, onPause, onContinue, onAnswerNow, onType, micDisabled }) {
  const status = state in STATUS ? STATUS[state] : STATUS.listening;
  const isListening = state === "listening" || state === "thinking" || state === "connecting";

  // Only surface an error when a start attempt fails (connecting -> idle), not after the user stops on purpose.
  const prevStateRef = useRef(state);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (state === "idle" && prevStateRef.current === "connecting") setFailed(true);
    else if (state !== "idle") setFailed(false);
    prevStateRef.current = state;
  }, [state]);
  const showError = failed && state === "idle" && Boolean(error);

  let main;
  if (state === "speaking") {
    main = { icon: Hand, label: "Answer now", onClick: onAnswerNow, className: "bg-emerald-600" };
  } else if (state === "paused") {
    main = { icon: Play, label: "Continue", onClick: onContinue, className: "bg-emerald-600" };
  } else if (isListening) {
    main = { icon: Mic, label: "Tap to turn mic off", onClick: onToggleMic, className: "bg-red-500 ring-6 ring-red-200", disabled: micDisabled };
  } else {
    main = { icon: Mic, label: "Tap to talk", onClick: onToggleMic, className: "bg-emerald-600", disabled: micDisabled };
  }
  const MainIcon = main.icon;

  return (
    <div
      className={`shrink-0 rounded-lg border border-gray-200 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden short:pt-1.5 short:pb-[max(0.375rem,env(safe-area-inset-bottom))] ${
        status?.tone || "bg-white"
      }`}
    >
      <p className="mb-2 min-h-5 text-center text-sm short:mb-1 short:text-xs" role="status">
        {showError ? (
          <span className="text-red-600">{friendlyError(error)}</span>
        ) : status ? (
          <>
            <span className="font-medium">{status.title}</span> {status.text}
          </>
        ) : (
          <span className="text-gray-600">{idleHint}</span>
        )}
      </p>
      <div className="flex items-center justify-between">
        {onPause && (isListening || state === "speaking") ? <SideButton icon={Pause} label="Pause" onClick={onPause} /> : <span className="w-16" />}
        <button
          type="button"
          onClick={main.onClick}
          disabled={main.disabled}
          aria-label={main.label}
          className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 disabled:opacity-40"
        >
          <span className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-white short:h-12 short:w-12 ${main.className}`}>
            <MainIcon size={30} className="short:size-6" />
          </span>
          <span className="short:hidden">{main.label}</span>
        </button>
        {onType ? <SideButton icon={Keyboard} label="Type" onClick={onType} /> : <span className="w-16" />}
      </div>
    </div>
  );
}
