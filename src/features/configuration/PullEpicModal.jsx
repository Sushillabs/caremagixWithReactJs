import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, Info } from "lucide-react";
import useEpicPull from "../../hooks/useEpicPull";

export default function PullEpicModal({ onClose, title = "Pull Epic Data" }) {
  const navigate = useNavigate();
  const { start, isRunning, error } = useEpicPull();
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    await start();
    setStarted(true);
  };

  // Sidebar (and this modal, mounted inside it) lives outside the route
  // <Outlet>, so it survives navigation — closing it explicitly here is
  // required, navigate() alone would leave it open on top of the Jobs page.
  useEffect(() => {
    if (!started || error) return;
    const t = setTimeout(() => {
      onClose();
      navigate("/app/jobs");
    }, 900);
    return () => clearTimeout(t);
  }, [started, error, navigate, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-[90dvh] sm:overflow-y-auto sm:rounded-2xl sm:w-[380px]">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-my-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 sm:m-0 sm:h-auto sm:w-auto sm:p-1"
          >
            <X size={16} className="size-5 text-gray-500 sm:size-4" />
          </button>
        </div>

        {started && !error ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-700">Pull started — taking you to the Jobs page...</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Pulls the latest Epic (EHR) patient data for your facility in the background. The facility must
              already be registered with Metriport for this to succeed.
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={handleStart}
              disabled={isRunning}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isRunning ? "Starting..." : "Start Pull"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
