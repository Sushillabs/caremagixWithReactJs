import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import WellnessQuestionEditor from "./WellnessQuestionEditor";

export default function WellnessQuestionsPanel({ patientName }) {
  const { setAssistantHidden } = useOutletContext() || {};

  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <HeartPulse size={14} className="text-emerald-600" />
          Wellness Check-in Questions{patientName ? ` — ${patientName}` : ""}
        </h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <WellnessQuestionEditor patientName={patientName} />
      </div>
    </div>
  );
}
