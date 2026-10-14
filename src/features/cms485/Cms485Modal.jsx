import { X, CheckCircle2, Info, ExternalLink, RefreshCw } from "lucide-react";
import useCms485Fill from "./useCms485Fill";

export default function Cms485Modal({ patient, onClose }) {
  const { start, isStarting, formLink, error } = useCms485Fill();

  const fill = (forceNew) => start({ ...patient, regenerate: forceNew });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-none sm:w-[400px] sm:overflow-visible sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <h2 className="text-sm font-semibold text-emerald-700">Plan of Care (CMS-485)</h2>
            <p className="text-xs text-gray-500">{patient?.patient_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {formLink ? (
          <div className="space-y-4 p-4">
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <p className="text-sm font-medium text-gray-700">Plan of Care is ready</p>
              <p className="text-xs text-gray-500">This patient already has a filled form.</p>
            </div>

            <a
              href={formLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <ExternalLink size={14} />
              Open Form
            </a>

            <button
              type="button"
              onClick={() => fill(true)}
              disabled={isStarting}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isStarting ? "animate-spin" : ""} />
              {isStarting ? "Starting..." : "Fill again with latest chart"}
            </button>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" />
              Fills the Home Health Certification and Plan of Care from this patient&apos;s chart. It runs in the
              background — you&apos;ll see progress on the Jobs page.
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <hr className="border-gray-100" />

            <button
              type="button"
              onClick={() => fill(false)}
              disabled={isStarting}
              className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isStarting ? "Starting..." : "Fill Plan of Care"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
