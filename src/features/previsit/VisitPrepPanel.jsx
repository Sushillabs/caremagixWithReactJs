import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom";
import { Check, Download, Loader2, Pencil } from "lucide-react";
import BriefView from "./BriefView";
import ExamPlanView from "./ExamPlanView";
import ExamPlanEditor from "./ExamPlanEditor";
import cleanPlan from "./cleanPlan";
import useBriefJob from "./useBriefJob";
import useExamPlanJob from "./useExamPlanJob";
import { getAmbientVisit } from "./ambientVisit";
import { toPatientKey } from "./previsitApi";
import { examPlanProgress, previsitProgress } from "./useVisitPrepRun";
import { visibleVisitPrep } from "./visibleVisitPrep";

const STEPS = [
  { key: "brief", label: "Pre-Visit Brief", short: "Brief" },
  { key: "visit", label: "Record Visit", short: "Visit" },
  { key: "exam", label: "Exam Plan", short: "Exam Plan" },
];

const PRIMARY_BTN = "min-h-8 shrink-0 rounded-md bg-emerald-800 px-2.5 text-xs font-medium text-white hover:bg-emerald-900 disabled:opacity-50";
const SECONDARY_BTN =
  "flex min-h-8 shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50";

function StepBar({ active, done, onSelect }) {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-gray-100 px-2 py-1 text-xs [scrollbar-width:none]">
      {STEPS.map((step, i) => {
        const isDone = done[step.key];
        const isActive = active === step.key;
        return (
          <div key={step.key} className="flex shrink-0 items-center gap-1">
            {i > 0 && <span className="h-px w-3 bg-gray-300 sm:w-6" />}
            <button
              type="button"
              onClick={() => onSelect(step.key)}
              title={`Go to ${step.label}`}
              aria-current={isActive ? "step" : undefined}
              className={`flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 hover:bg-emerald-100"
                  : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] ${
                  isDone ? "bg-emerald-600 text-white" : isActive ? "border border-emerald-600 text-emerald-700" : "border border-gray-300"
                }`}
              >
                {isDone ? <Check size={12} /> : i + 1}
              </span>
              <span className="sm:hidden">{step.short}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RunningBanner({ text }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm text-emerald-800">
      <Loader2 size={16} className="animate-spin" />
      <span>Generating... {text}</span>
      <Link to="/app/jobs" className="ml-auto inline-flex min-h-8 items-center text-xs font-medium underline">
        View on Jobs page
      </Link>
    </div>
  );
}

export default function VisitPrepPanel({ patientName, initialStep, onOpenAmbientAi }) {
  const [active, setActive] = useState(STEPS.some((step) => step.key === initialStep) ? initialStep : "brief");
  const userId = useSelector((state) => state.auth?.value?.user_id);
  const patientKey = toPatientKey(patientName);
  const visit = getAmbientVisit(userId, patientKey);
  const briefJob = useBriefJob(patientName);
  const examJob = useExamPlanJob(patientName, visit);
  const { setAssistantHidden } = useOutletContext() || {};

  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  useEffect(() => {
    visibleVisitPrep.patientKey = patientKey;
    return () => {
      visibleVisitPrep.patientKey = null;
    };
  }, [patientKey]);

  const hasBrief = !!briefJob.brief;
  const done = { brief: hasBrief, visit: !!visit, exam: !!examJob.plan };

  const [draft, setDraft] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const isEditing = !!draft;
  const isDirty = isEditing && JSON.stringify(draft) !== JSON.stringify(examJob.plan);

  const confirmDiscard = () => !isDirty || window.confirm("Discard unsaved changes?");

  const startEdit = () => {
    setJustSaved(false);
    setDraft(structuredClone(examJob.plan));
  };

  const cancelEdit = () => {
    if (confirmDiscard()) setDraft(null);
  };

  const saveEdit = async () => {
    const ok = await examJob.save(cleanPlan(draft));
    if (ok) {
      setDraft(null);
      setJustSaved(true);
    }
  };

  const selectStep = (key) => {
    if (key === active || !confirmDiscard()) return;
    setDraft(null);
    setActive(key);
  };

  const generateExamPlan = () => {
    if (!confirmDiscard()) return;
    if (examJob.edited && !window.confirm("Generate a new AI exam plan? It replaces the plan shown here. Your saved edits stay on the old plan.")) {
      return;
    }
    setDraft(null);
    setJustSaved(false);
    examJob.generate();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 bg-[#F0FDF4] px-3 py-1.5">
        <h3 className="mr-auto text-xs font-bold text-gray-800">Visit Prep</h3>
        {active === "brief" && (
          <>
            {briefJob.brief && briefJob.runId && (
              <button type="button" onClick={briefJob.downloadPdf} disabled={briefJob.isDownloading} className={SECONDARY_BTN}>
                <Download size={14} />
                {briefJob.isDownloading ? "Downloading..." : "Download PDF"}
              </button>
            )}
            <button
              type="button"
              onClick={briefJob.generate}
              disabled={briefJob.isStarting || briefJob.isRunning || !patientName}
              className={PRIMARY_BTN}
            >
              {briefJob.isStarting ? "Starting..." : briefJob.brief ? "Generate new" : "Generate Brief"}
            </button>
          </>
        )}
        {active === "visit" && (
          <button type="button" onClick={onOpenAmbientAi} className={PRIMARY_BTN}>
            {visit ? "Record again" : "Open Ambient AI"}
          </button>
        )}
        {active === "exam" && isEditing && (
          <>
            <button type="button" onClick={cancelEdit} disabled={examJob.isSaving} className={SECONDARY_BTN}>
              Cancel
            </button>
            <button type="button" onClick={saveEdit} disabled={examJob.isSaving || !isDirty} className={PRIMARY_BTN}>
              {examJob.isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
        {active === "exam" && !isEditing && (
          <>
            {examJob.plan && examJob.runId && !examJob.isRunning && (
              <button type="button" onClick={startEdit} className={SECONDARY_BTN}>
                <Pencil size={14} />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={generateExamPlan}
              disabled={examJob.isStarting || examJob.isRunning || !hasBrief || !patientName}
              className={PRIMARY_BTN}
            >
              {examJob.isStarting ? "Starting..." : examJob.plan ? "Generate new" : "Generate Exam Plan"}
            </button>
          </>
        )}
      </div>

      <StepBar active={active} done={done} onSelect={selectStep} />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
        {active === "brief" && (
          <>
            {briefJob.isRunning && <RunningBanner text={previsitProgress(briefJob.run).text} />}
            {briefJob.error && <p className="text-sm text-red-600">{briefJob.error}</p>}
            {briefJob.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
            {!briefJob.isLoading && !hasBrief && !briefJob.isRunning && (
              <p className="text-sm text-gray-500">No brief yet. Generate a summary of the patient's records before the visit.</p>
            )}
            {hasBrief && <BriefView brief={briefJob.brief} />}
          </>
        )}

        {active === "visit" &&
          (visit ? (
            <p className="flex items-center gap-2 text-sm text-emerald-800">
              <Check size={16} />
              Visit recorded at {new Date(visit.saved_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Record the visit with Ambient AI. Generate the visit note there, then come back for the Exam Plan.
            </p>
          ))}

        {active === "exam" && (
          <>
            {!hasBrief && (
              <p className="text-sm text-gray-600">
                Generate the Pre-Visit Brief first.{" "}
                <button
                  type="button"
                  onClick={() => setActive("brief")}
                  className="inline-flex min-h-8 items-center font-medium text-emerald-700 underline"
                >
                  Go to Pre-Visit Brief
                </button>
              </p>
            )}
            {hasBrief && !visit && !examJob.plan && (
              <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-sm text-amber-800">
                No visit recorded here yet. The latest Ambient AI visit for this patient will be used.{" "}
                <button type="button" onClick={onOpenAmbientAi} className="inline-flex min-h-8 items-center font-medium underline">
                  Open Ambient AI
                </button>
              </p>
            )}
            {examJob.isRunning && <RunningBanner text={examPlanProgress(examJob.run).text} />}
            {examJob.error && <p className="text-sm text-red-600">{examJob.error}</p>}
            {examJob.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
            {hasBrief && !examJob.isLoading && !examJob.plan && !examJob.isRunning && <p className="text-sm text-gray-500">No exam plan yet.</p>}
            {examJob.saveError && <p className="text-sm text-red-600">{examJob.saveError}</p>}
            {justSaved && !isEditing && <p className="text-sm text-emerald-700">Exam plan saved.</p>}
            {examJob.edited && !isEditing && (
              <p className="text-xs text-gray-500">
                Edited by physician
                {examJob.editedAt &&
                  ` · ${new Date(examJob.editedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
              </p>
            )}
            {isEditing && <ExamPlanEditor draft={draft} setDraft={setDraft} />}
            {!isEditing && examJob.plan && <ExamPlanView plan={examJob.plan} />}
          </>
        )}
      </div>
    </div>
  );
}
