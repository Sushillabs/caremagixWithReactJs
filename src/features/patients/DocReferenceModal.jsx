import { useEffect, useState } from "react";
import { X, FileText, Pill, Activity, AlertTriangle, Syringe, ClipboardList, CalendarClock, FileCheck, User, Stethoscope, FlaskConical } from "lucide-react";
import { getDocRef } from "../../api/hospitalApi";

// Matches config/sections.js-style capitalization from PatientsList.jsx
// ("Pcc" | "Epic" | "Metriport" | "Uploaded") to the label the backend's own
// DOC_REF_SOURCE_LABELS uses, so the header reads the same on both sides.
const SOURCE_LABELS = {
  Pcc: "PointClickCare",
  Epic: "Epic",
  Metriport: "Metriport",
  Uploaded: "Uploaded",
};

function PdfEntry({ entry, index }) {
  const pdfName = (entry.pdf_url || "").split("/").pop() || "PDF";
  return (
    <div className="rounded-md border border-gray-200 p-3 text-sm">
      <div className="flex items-center gap-2">
        <FileText size={14} className="shrink-0 text-emerald-600" />
        <a href={entry.pdf_url} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 hover:underline">
          {index + 1}. {pdfName}
        </a>
      </div>
      {(entry.pages || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.pages.map((page) => (
            <a
              key={page}
              href={`${entry.pdf_url}#page=${page + 1}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Page {page + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// EHR entries share one shape across PCC/Epic/Metriport (only `source`
// differs) but `collection_name` comes through in two different namings —
// PCC's own lowercase api names ("conditions", "care-plans") and FHIR
// resourceType names ("MedicationRequest", "AllergyIntolerance") for
// Epic/Metriport. Match on a normalized substring so both work, and drive
// the label from `collection_name` (case preserved) instead of the
// backend's own `label` field, which collapses camelCase FHIR names
// ("MedicationRequest" -> "Medicationrequest" via Python's .title()).
const CATEGORY_META = [
  { match: "medication", label: "Medications", icon: Pill },
  { match: "condition", label: "Conditions", icon: Stethoscope },
  { match: "allerg", label: "Allergies", icon: AlertTriangle },
  { match: "immuniz", label: "Immunizations", icon: Syringe },
  { match: "careplan", label: "Care Plans", icon: ClipboardList },
  { match: "diagnostic", label: "Diagnostic Reports", icon: FlaskConical },
  { match: "observ", label: "Observations", icon: Activity },
  { match: "adtrecord", label: "Admit/Discharge/Transfer", icon: CalendarClock },
  { match: "encounter", label: "Encounters", icon: CalendarClock },
  { match: "consent", label: "Consent", icon: FileCheck },
  { match: "patientinfo", label: "Patient Info", icon: User },
  { match: "procedure", label: "Procedures", icon: Stethoscope },
];

function normalizeKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
}

function categoryFor(collectionName) {
  const norm = normalizeKey(collectionName);
  return CATEGORY_META.find((c) => norm.includes(c.match));
}

// PCC's snippets are hand-written prose; Epic/Metriport's are a raw
// str(list_of_FHIR_resources) dump (traced in metriport.py) — monospace
// styling is honest about that instead of presenting both as if they were
// equally readable text.
function EhrEntry({ entry, index }) {
  const category = categoryFor(entry.collection_name);
  const Icon = category?.icon || FileText;
  const label = category?.label || entry.label || entry.collection_name || "Source";

  return (
    <div className="rounded-md border border-gray-200 p-3 text-sm">
      <div className="flex items-center gap-2">
        <Icon size={14} className="shrink-0 text-emerald-600" />
        <span className="font-medium text-gray-800">
          {index + 1}. {label}
        </span>
        {entry.source && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">{entry.source}</span>}
      </div>
      <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 font-mono text-[11px] leading-relaxed text-gray-600">
        {entry.snippet || "No source excerpt available."}
      </div>
    </div>
  );
}

export default function DocReferenceModal({ questionId, sourceType, onClose }) {
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDocRef({ question_id: questionId })
      .then((res) => {
        if (res?.error) setError(res.error);
        else setEntries(res?.entries || []);
      })
      .catch((err) => setError(err?.response?.data?.error || "Could not load document references"))
      .finally(() => setLoading(false));
  }, [questionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[80vh] w-[480px] flex-col rounded-2xl bg-white shadow-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Document Reference</p>
            <h2 className="text-sm font-semibold text-emerald-700">{SOURCE_LABELS[sourceType] || sourceType || "Source"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {loading && <p className="text-sm text-gray-400">Loading sources...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && entries?.length === 0 && <p className="text-sm text-gray-400">No document references found for this answer.</p>}
          {!loading &&
            !error &&
            entries?.map((entry, i) =>
              entry.type === "pdf" ? <PdfEntry key={entry.pdf_url || i} entry={entry} index={i} /> : <EhrEntry key={entry.collection_name || i} entry={entry} index={i} />
            )}
        </div>
      </div>
    </div>
  );
}
