import { Mic } from "lucide-react";

function WaveformBars() {
  const heights = [6, 12, 18, 12, 6];
  return (
    <div className="flex items-center gap-0.5">
      {heights.map((h, i) => (
        <span key={i} className="w-0.5 rounded-full bg-emerald-400" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function VoiceStartGate({ label = "Talk to Caremagix AI Assistant", onStart }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white">
      <button type="button" onClick={onStart} className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-10 py-6 hover:bg-emerald-100">
        <div className="flex items-center gap-3">
          <WaveformBars />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Mic size={26} />
          </span>
          <WaveformBars />
        </div>
        <span className="text-sm font-semibold text-emerald-700">{label}</span>
      </button>
    </div>
  );
}
