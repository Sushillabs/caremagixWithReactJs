import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, Info } from "lucide-react";
import usePccPull from "../../hooks/usePccPull";

export default function PullPccModal({ onClose }) {
  const navigate = useNavigate();
  const { start, isRunning, error } = usePccPull();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[380px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Pull PCC Data</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
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
              Pulls the latest PointClickCare patient data for your facility in the background.
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
