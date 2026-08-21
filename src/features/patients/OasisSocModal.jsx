import { useState } from "react";
import { X } from "lucide-react";

// Static mock of the OASIS-E2 Start of Care (SOC) Assessment form — visual
// reference build only, wired to the "OASIS-SOC" Forms item and nothing
// else. Only the patient name is dynamic; every other field/button here is
// decorative (no export/save/clear logic, no per-section content) until a
// real assessment engine exists to back it.
const SECTIONS = [
  "Cover", "A · Admin", "B · Hearing/Vision", "C · Cognition", "D · Mood", "E · Behavior",
  "F · Living", "G · Functional", "GG · Abilities", "H · Bladder/Bowel", "I · Diagnoses",
  "J · Health Cond.", "K · Nutrition", "M · Skin", "N · Medications", "O · Special Tx",
];

export default function OasisSocModal({ patientName, onClose }) {
  const [activeSection, setActiveSection] = useState("Cover");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative shrink-0 bg-[#0B1B3A] px-5 py-4 font-mono text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="flex items-start justify-between pr-8">
            <div>
              <h2 className="text-lg font-bold">OASIS-E2 Start of Care (SOC) Assessment</h2>
              <p className="mt-0.5 text-xs text-slate-300">Outcome and Assessment Information Set · Version E2</p>
            </div>
            <span className="shrink-0 rounded bg-blue-800 px-2 py-1 text-[10px] font-semibold tracking-wide">
              CMS · Effective 04/01/2026
            </span>
          </div>
        </div>

        {/* Completion */}
        <div className="shrink-0 bg-[#0B1B3A] px-5 py-2 font-mono text-white">
          <div className="flex items-center gap-3 text-[10px] tracking-wide text-slate-300">
            <span>COMPLETION</span>
            <div className="h-1.5 flex-1 rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-blue-400" style={{ width: "99%" }} />
            </div>
            <span>99%</span>
          </div>
        </div>

        {/* Patient name */}
        <div className="shrink-0 flex flex-wrap items-center gap-3 bg-[#0B1B3A] px-5 pb-4 pt-2 font-mono text-white">
          <span className="text-[10px] tracking-wide text-slate-300">PATIENT NAME</span>
          <span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
            {patientName || "Patient"}
          </span>
          <span className="rounded bg-amber-600 px-2 py-1 text-[10px] font-bold tracking-wide">REVIEW MODE</span>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-300" /> No saved data
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
              Export JSON
            </button>
            <button type="button" className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
              Import JSON
            </button>
            <button type="button" className="rounded bg-green-700 px-2 py-1 text-xs font-medium text-white hover:bg-green-800">
              Export CMS XML
            </button>
            <button type="button" className="rounded bg-blue-700 px-2 py-1 text-xs font-medium text-white hover:bg-blue-800">
              Save Now
            </button>
            <button type="button" className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">
              Clear All
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="shrink-0 flex flex-wrap gap-1.5 border-b border-gray-200 px-5 py-2">
          {SECTIONS.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                activeSection === section ? "bg-blue-800 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="rounded-lg bg-[#0B1B3A] p-4 font-mono text-white">
            <h3 className="text-base font-bold">OASIS-E2 Start of Care (SOC) Assessment</h3>
            <p className="mt-1 text-xs text-blue-300">Outcome and Assessment Information Set · Version E2</p>
            <div className="mt-3 border-t border-white/10 pt-3 text-[11px] text-slate-300">
              Effective: 04/01/2026&nbsp;&nbsp;&nbsp;Agency: Centers for Medicare &amp; Medicaid Services&nbsp;&nbsp;&nbsp;Pages: 1-23 of 23
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 bg-[#0B1B3A] px-3 py-2 text-white">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] tracking-wide text-blue-300">PRA NOTICE</span>
              <span className="text-sm font-semibold">Paperwork Reduction Act Disclosure</span>
            </div>
            <div className="bg-blue-50 px-3 py-2 text-xs text-blue-900">
              According to the Paperwork Reduction Act of 1995, no persons are required to respond to a collection of
              information unless it displays a valid OMB control number. The time required to complete this information
              collection is estimated to be XX minutes per data element.
            </div>
          </div>

          <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="font-semibold">SOC Note:</span> This Start of Care assessment is administered at the start
            of home health services. M0100 is always coded 01 (Start of care), TRANS_TYPE_CD = 1 (Add new record).
          </div>
        </div>
      </div>
    </div>
  );
}