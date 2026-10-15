import { useState } from "react";
import { X } from "lucide-react";
import TransitionCareServicesPage from "../services/TransitionCareServicesPage";
import TcmPatientDetail from "../tcm/TcmPatientDetail";

const TABS = [
  { key: "transitionCare", label: "Transition Care" },
  { key: "services", label: "Services" },
];

export default function TransitionCarePlanModal({ patientName, onClose }) {
  const [activeTab, setActiveTab] = useState("transitionCare");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-[80vh] sm:w-[520px] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-emerald-700">Transition-Care Plan</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-my-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 sm:m-0 sm:h-auto sm:w-auto sm:p-1"
          >
            <X size={16} className="size-5 text-gray-500 sm:size-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key ? "bg-white text-emerald-700 shadow" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-70">
            {activeTab === "services" ? <TransitionCareServicesPage /> : <TcmPatientDetail patientKey={patientName} />}
          </div>
        </div>
      </div>
    </div>
  );
}
