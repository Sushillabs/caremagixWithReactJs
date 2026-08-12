import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, Loader2, Circle } from "lucide-react";
import useCarePlan from "../../hooks/useCarePlan";
import useCarePlanStatus from "../../hooks/useCarePlanStatus";
import { getCarePlan, updateCarePlan, exportCarePlanPdf } from "../../api/hospitalApi";
import { getPatientKey } from "../../utils/buildPatientPayload";
import { saveFinalJobStatus } from "../../redux/finalJobsStatusSlice";

// Plans generated before the "selected" checkbox field existed won't have
// it on their items — normalize it to a real boolean (missing = unchecked)
// so downstream rendering can always rely on it being present.
const CARE_PLAN_ITEM_LIST_KEYS = ["smart_goals", "interventions", "patient_self_management_actions", "potential_barriers"];

function normalizeSections(sections) {
  return (sections || []).map((section) => {
    const normalized = { ...section };
    for (const key of CARE_PLAN_ITEM_LIST_KEYS) {
      if (Array.isArray(section[key])) {
        normalized[key] = section[key].map((item) => ({ ...item, selected: Boolean(item.selected) }));
      }
    }
    return normalized;
  });
}

const GENERATION_STEPS = [
  { at: 10, label: "Extracting patient information" },
  { at: 50, label: "Identifying patient problems" },
  { at: 75, label: "Setting SMART goals" },
  { at: 90, label: "Generating care plan" },
  { at: 100, label: "Saving & finalizing" },
];

function GenerationProgress({ progress, message }) {
  const currentIndex = GENERATION_STEPS.findIndex((s) => progress < s.at);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <ul className="space-y-4">
        {GENERATION_STEPS.map((step, i) => {
          const isDone = currentIndex === -1 || i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <li key={step.label} className="flex items-start gap-3">
              {isDone ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
              ) : isCurrent ? (
                <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-emerald-500" />
              ) : (
                <Circle size={18} className="mt-0.5 shrink-0 text-gray-300" />
              )}
              <div>
                <p className={isDone ? "text-sm text-gray-500" : isCurrent ? "text-sm font-medium text-gray-800" : "text-sm text-gray-400"}>
                  {step.label}
                </p>
                {isCurrent && message && <p className="mt-0.5 text-xs text-gray-400">{message}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const STATUS_LABELS = [
  { key: "not_started", label: "Start" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Complete" },
];

function StatusRow({ status, editing, onChange }) {
  if (!editing) {
    return (
      <span className="flex items-center gap-3 text-xs text-gray-400">
        {STATUS_LABELS.map((s) => (
          <span key={s.key} className={s.key === status ? "font-medium text-emerald-600" : ""}>
            {s.label}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3 text-xs">
      {STATUS_LABELS.map((s) => (
        <label key={s.key} className="flex cursor-pointer items-center gap-1">
          <input type="radio" checked={s.key === status} onChange={() => onChange(s.key)} className="h-3 w-3 accent-emerald-600" />
          <span className={s.key === status ? "font-medium text-emerald-600" : "text-gray-500"}>{s.label}</span>
        </label>
      ))}
    </span>
  );
}

// Checkbox stays visible read-only too (disabled) so it's clear what's
// selected even outside edit mode — matches the original printed-form
// idea where every candidate item shows its box, checked or not.
function ItemList({ items, editing, onItemChange }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(item.selected)}
            disabled={!editing}
            onChange={(e) => onItemChange(i, "selected", e.target.checked)}
            className="h-4 w-4 shrink-0 accent-emerald-600 disabled:opacity-60"
          />
          {editing ? (
            <input
              type="text"
              value={item.text}
              onChange={(e) => onItemChange(i, "text", e.target.value)}
              className="min-w-[12rem] flex-1 rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
            />
          ) : (
            <span className="flex-1">{item.text}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
            Target Date:{" "}
            {editing ? (
              <input
                type="date"
                value={item.target_date || ""}
                onChange={(e) => onItemChange(i, "target_date", e.target.value)}
                className="rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-700"
              />
            ) : (
              item.target_date || "__________"
            )}
          </span>
          <StatusRow status={item.status} editing={editing} onChange={(status) => onItemChange(i, "status", status)} />
        </li>
      ))}
    </ul>
  );
}

const SUBSECTIONS = [
  { key: "problem", label: "Problem", type: "text" },
  { key: "smart_goals", label: "SMART Goals (select ≥1; prioritized)", type: "items" },
  { key: "interventions", label: "Interventions (select ≥1)", type: "items" },
  { key: "patient_self_management_actions", label: "Patient Self-Management Actions (select ≥1)", type: "items" },
  { key: "red_flag_symptoms", label: "Red-Flag Symptoms — Educate Patient to Report", type: "text-list" },
  { key: "potential_barriers", label: "Potential Barriers", type: "items" },
  { key: "evidence_based_references", label: "Evidence-Based References", type: "text-list" },
];

// Care Manager fills this in over time (contact-by-contact); the AI never
// populates it. Old plans may still have the legacy empty-array shape —
// normalize to the {header_data, table_data} object either way.
const DEFAULT_ASSESSMENT_CAPTION =
  "Care Manager documents progress toward each goal and completion of each intervention at every contact.";
function getAssessmentOfProgress(section) {
  const aop = section.assessment_of_progress;
  const isObjectShape = aop && !Array.isArray(aop);
  return {
    header_data: (isObjectShape && aop.header_data) || DEFAULT_ASSESSMENT_CAPTION,
    table_data: {
      date: "",
      goal_intervention: "",
      status: "",
      note: "",
      ...(isObjectShape ? aop.table_data : null),
    },
  };
}

function CarePlanSection({
  section,
  index,
  open,
  editing,
  onToggle,
  onEdit,
  onCancel,
  onSave,
  onItemChange,
  onFieldChange,
  onTextListChange,
  onAssessmentChange,
}) {
  const assessment = getAssessmentOfProgress(section);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          <span className="font-medium text-gray-800">
            {index + 1}. {section.title}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="button" onClick={onSave} className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
          >
            Edit
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-4 px-4 pb-4 text-sm">
          {SUBSECTIONS.map((sub) => {
            const value = section[sub.key];
            if (sub.type === "text" && !value) return null;
            if ((sub.type === "items" || sub.type === "text-list") && !value?.length) return null;

            return (
              <div key={sub.key}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{sub.label}</h4>
                {sub.type === "text" &&
                  (editing ? (
                    <textarea
                      value={value}
                      onChange={(e) => onFieldChange(sub.key, e.target.value)}
                      rows={3}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-700">{value}</p>
                  ))}
                {sub.type === "text-list" &&
                  (editing ? (
                    <ul className="space-y-1">
                      {value.map((line, i) => (
                        <li key={i}>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => onTextListChange(sub.key, i, e.target.value)}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4 text-gray-700">
                      {value.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ))}
                {sub.type === "items" && (
                  <ItemList
                    items={value}
                    editing={editing}
                    onItemChange={(itemIndex, field, val) => onItemChange(sub.key, itemIndex, field, val)}
                  />
                )}
              </div>
            );
          })}

          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Assessment of Progress</h4>
            {editing ? (
              <textarea
                value={assessment.header_data}
                onChange={(e) => onAssessmentChange("header_data", e.target.value)}
                rows={2}
                className="mb-2 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-700"
              />
            ) : (
              <p className="mb-2 text-xs text-gray-400">{assessment.header_data}</p>
            )}
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border border-gray-200 bg-gray-50 text-left text-gray-500">
                  <th className="border border-gray-200 px-2 py-1">Date</th>
                  <th className="border border-gray-200 px-2 py-1">Goal / Intervention</th>
                  <th className="border border-gray-200 px-2 py-1">Status</th>
                  <th className="border border-gray-200 px-2 py-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">
                    {editing ? (
                      <input
                        type="date"
                        value={assessment.table_data.date}
                        onChange={(e) => onAssessmentChange("date", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-700"
                      />
                    ) : (
                      assessment.table_data.date || " "
                    )}
                  </td>
                  <td className="border border-gray-200 px-2 py-1">
                    {editing ? (
                      <input
                        type="text"
                        value={assessment.table_data.goal_intervention}
                        onChange={(e) => onAssessmentChange("goal_intervention", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-700"
                      />
                    ) : (
                      assessment.table_data.goal_intervention || " "
                    )}
                  </td>
                  <td className="border border-gray-200 px-2 py-1">
                    {editing ? (
                      <input
                        type="text"
                        value={assessment.table_data.status}
                        onChange={(e) => onAssessmentChange("status", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-700"
                      />
                    ) : (
                      assessment.table_data.status || " "
                    )}
                  </td>
                  <td className="border border-gray-200 px-2 py-1">
                    {editing ? (
                      <input
                        type="text"
                        value={assessment.table_data.note}
                        onChange={(e) => onAssessmentChange("note", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-700"
                      />
                    ) : (
                      assessment.table_data.note || " "
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-gray-500">
            Follow-up Communication — Method: {section.follow_up_communication?.method || "________"}. Next contact date:{" "}
            {section.follow_up_communication?.next_contact_date || "________"}.
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarePlanDetailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientKey = getPatientKey(singleData?.patient_name, singleData?.patient_type);
  const { generate, isStarting, error: startError } = useCarePlan();
  const { status, progress, message, carePlanId, carePlanData: statusCarePlanData } = useCarePlanStatus(patientKey);
  const [openIndex, setOpenIndex] = useState(0);
  // Which section (if any) is currently unlocked for editing — only one at a
  // time. sectionOverrides holds locally-committed (Save clicked) edits per
  // section index, kept separate from the AI-generated baseline so Cancel
  // can always fall back to "whatever was there before this edit session."
  // draftSection is the live working copy while a section is being edited.
  // Nothing here calls the backend yet — that's Step 5.
  const [editingIndex, setEditingIndex] = useState(null);
  const [sectionOverrides, setSectionOverrides] = useState({});
  const [draftSection, setDraftSection] = useState(null);

  const handleEditSection = (i, baseSection) => {
    setEditingIndex(i);
    setOpenIndex(i); // editing a collapsed section doesn't make sense — force it open
    setDraftSection(JSON.parse(JSON.stringify(sectionOverrides[i] || baseSection)));
  };
  const handleCancelSection = () => {
    setEditingIndex(null);
    setDraftSection(null);
  };
  const handleSaveSection = () => {
    setSectionOverrides((prev) => ({ ...prev, [editingIndex]: draftSection }));
    setEditingIndex(null);
    setDraftSection(null);
  };
  const handleDraftItemChange = (subKey, itemIndex, field, value) => {
    setDraftSection((prev) => ({
      ...prev,
      [subKey]: prev[subKey].map((item, idx) => (idx === itemIndex ? { ...item, [field]: value } : item)),
    }));
  };
  const handleDraftFieldChange = (key, value) => {
    setDraftSection((prev) => ({ ...prev, [key]: value }));
  };
  const handleDraftTextListChange = (key, itemIndex, value) => {
    setDraftSection((prev) => ({
      ...prev,
      [key]: prev[key].map((line, idx) => (idx === itemIndex ? value : line)),
    }));
  };
  const handleDraftAssessmentChange = (field, value) => {
    setDraftSection((prev) => {
      const current = getAssessmentOfProgress(prev);
      if (field === "header_data") {
        return { ...prev, assessment_of_progress: { ...current, header_data: value } };
      }
      return {
        ...prev,
        assessment_of_progress: { ...current, table_data: { ...current.table_data, [field]: value } },
      };
    });
  };

  // Same local-draft / local-commit pattern as sections, but for the
  // patient info block — its own independent edit session, not tied to
  // any section index.
  const [editingPatient, setEditingPatient] = useState(false);
  const [patientOverride, setPatientOverride] = useState(null);
  const [draftPatient, setDraftPatient] = useState(null);
  const handleEditPatient = (basePatient) => {
    setEditingPatient(true);
    setDraftPatient({ ...(patientOverride || basePatient) });
  };
  const handleCancelPatient = () => {
    setEditingPatient(false);
    setDraftPatient(null);
  };
  const handleSavePatient = () => {
    setPatientOverride(draftPatient);
    setEditingPatient(false);
    setDraftPatient(null);
  };
  const handleDraftPatientChange = (field, value) => {
    setDraftPatient((prev) => ({ ...prev, [field]: value }));
  };

  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Normal case: the just-generated plan is already in shared state
  // (statusCarePlanData) — no fetch needed. Fallback only: status is "done"
  // but we don't have the content (e.g. after a reload wiped redux/cache) —
  // then fetch it by ID.
  const needsFetch = status === "done" && !statusCarePlanData && !!carePlanId;
  const { data: fetched, isLoading: isFetching } = useQuery({
    queryKey: ["care-plan", carePlanId],
    queryFn: () => getCarePlan(carePlanId),
    enabled: needsFetch,
  });

  const handleGenerate = () => {
    generate({
      patient_name: singleData?.patient_name,
      patient_type: singleData?.patient_type,
      doc_title: singleData?.dates,
      regenerate: true,
    });
  };

  const carePlanData = statusCarePlanData || fetched?.care_plan_data;
  const basePatient = carePlanData?.patient;
  const patient = patientOverride || basePatient;
  const sections = normalizeSections(carePlanData?.sections);
  // Locally-saved edits (per section) layered on top of the AI-generated
  // baseline — this is what actually renders, everywhere except the section
  // currently being edited (that one shows the live draft instead).
  const effectiveSections = sections.map((s, i) => sectionOverrides[i] || s);
  const hasUnsavedChanges = patientOverride !== null || Object.keys(sectionOverrides).length > 0;
  // Editing a section/patient block only updates its own local draft until
  // that block's own Save is clicked — force those to be committed first so
  // a page-level Save never silently drops an in-progress edit.
  const isMidEdit = editingIndex !== null || editingPatient;

  const handleSaveCarePlan = async () => {
    if (!carePlanId) return false;
    setIsSavingPlan(true);
    try {
      const merged = { ...carePlanData, patient, sections: effectiveSections };
      const response = await updateCarePlan(carePlanId, merged);
      // Same finalization dispatch useJobsTracker uses on job completion —
      // this becomes the newest entry for this patientKey, so
      // useCarePlanStatus (here and anywhere else this patient is opened
      // again this session) reads the saved edits instead of stale data.
      dispatch(
        saveFinalJobStatus({
          jobId: `saved-${carePlanId}-${Date.now()}`,
          status: "COMPLETED",
          message: "Care plan saved",
          carePlanId,
          carePlanData: response.care_plan_data,
          patientKey,
        })
      );
      setPatientOverride(null);
      setSectionOverrides({});
      toast.success("Care plan saved.");
      return true;
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.message || "Failed to save care plan.";
      toast.error(errMsg);
      return false;
    } finally {
      setIsSavingPlan(false);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const handleGeneratePdf = async () => {
    if (!carePlanId) return;
    // The PDF always comes from what's saved on the server — auto-save any
    // pending local edits first so it never reflects a stale version.
    if (hasUnsavedChanges) {
      const saved = await handleSaveCarePlan();
      if (!saved) return; // save already showed an error toast — don't export a stale/unsaved plan
    }
    setIsGeneratingPdf(true);
    try {
      const response = await exportCarePlanPdf(carePlanId);
      if (response?.file_path) {
        window.open(response.file_path, "_blank", "noopener,noreferrer");
        toast.success("Care plan PDF generated.");
      } else {
        toast.error("Failed to generate care plan PDF.");
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.message || "Failed to generate care plan PDF.";
      toast.error(errMsg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Care Plan
        </button>
        <h3 className="font-semibold text-gray-800">Care Plan{patient?.name ? ` — ${patient.name}` : ""}</h3>

        {carePlanData && (
          <div className="ml-auto flex items-center gap-2">
            {hasUnsavedChanges && !isSavingPlan && !isGeneratingPdf && (
              <span className="text-xs text-amber-600">Unsaved changes</span>
            )}
            <button
              type="button"
              onClick={handleSaveCarePlan}
              disabled={isSavingPlan || isGeneratingPdf || !hasUnsavedChanges || isMidEdit}
              title={isMidEdit ? "Finish editing the open section first" : undefined}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSavingPlan ? "Saving..." : "Save Care Plan"}
            </button>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isSavingPlan || isGeneratingPdf || isMidEdit}
              title={isMidEdit ? "Finish editing the open section first" : undefined}
              className="rounded-md border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {status === "idle" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
            <p className="text-sm text-gray-500">No care plan generated yet for this patient.</p>
            <button
              type="button"
              disabled={isStarting}
              onClick={handleGenerate}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isStarting ? "Starting..." : "Generate Care Plan"}
            </button>
            {startError && <p className="text-sm text-red-600">Error: {startError}</p>}
          </div>
        ) : status === "running" ? (
          <GenerationProgress progress={progress} message={message} />
        ) : status === "failed" ? (
          <p className="p-4 text-sm text-red-600">Error: {message}</p>
        ) : isFetching || !carePlanData ? (
          <p className="p-4 text-sm text-gray-400">Loading saved care plan...</p>
        ) : (
          <>
            <div className="border-b border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="mb-2 flex items-center justify-end gap-2">
                {editingPatient ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelPatient}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePatient}
                      className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEditPatient(patient)}
                    className="rounded-md border border-emerald-200 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-gray-500">Patient Name</span>
                  <p className="text-gray-800">{patient?.name || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Primary Care Provider</span>
                  {editingPatient ? (
                    <input
                      type="text"
                      value={draftPatient?.primary_care_provider || ""}
                      onChange={(e) => handleDraftPatientChange("primary_care_provider", e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.primary_care_provider || "________"}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-gray-500">Diagnosis</span>
                  {editingPatient ? (
                    <textarea
                      value={draftPatient?.diagnosis || ""}
                      onChange={(e) => handleDraftPatientChange("diagnosis", e.target.value)}
                      rows={2}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.diagnosis || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500">Plan Start Date</span>
                  {editingPatient ? (
                    <input
                      type="date"
                      value={draftPatient?.plan_start_date || ""}
                      onChange={(e) => handleDraftPatientChange("plan_start_date", e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.plan_start_date || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500">Plan End Date</span>
                  {editingPatient ? (
                    <input
                      type="date"
                      value={draftPatient?.plan_end_date || ""}
                      onChange={(e) => handleDraftPatientChange("plan_end_date", e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.plan_end_date || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500">Date Acknowledged by Patient</span>
                  {editingPatient ? (
                    <input
                      type="date"
                      value={draftPatient?.date_acknowledged_by_patient || ""}
                      onChange={(e) => handleDraftPatientChange("date_acknowledged_by_patient", e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.date_acknowledged_by_patient || "________"}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500">Next Follow-up Date</span>
                  {editingPatient ? (
                    <input
                      type="date"
                      value={draftPatient?.next_follow_up_date || ""}
                      onChange={(e) => handleDraftPatientChange("next_follow_up_date", e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.next_follow_up_date || "________"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-100 bg-emerald-50 px-4 py-2 text-xs">
              {sections.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className={i === openIndex ? "font-medium text-emerald-700 underline" : "text-emerald-600 hover:underline"}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>

            {effectiveSections.map((section, i) => (
              <CarePlanSection
                key={i}
                section={editingIndex === i && draftSection ? draftSection : section}
                index={i}
                open={openIndex === i}
                editing={editingIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                onEdit={() => handleEditSection(i, section)}
                onCancel={handleCancelSection}
                onSave={handleSaveSection}
                onItemChange={handleDraftItemChange}
                onFieldChange={handleDraftFieldChange}
                onTextListChange={handleDraftTextListChange}
                onAssessmentChange={handleDraftAssessmentChange}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
