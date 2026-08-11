import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, Loader2, Circle } from "lucide-react";
import useCarePlan from "../../hooks/useCarePlan";
import useCarePlanStatus from "../../hooks/useCarePlanStatus";
import { getCarePlan } from "../../api/hospitalApi";
import { getPatientKey } from "../../utils/buildPatientPayload";

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

// Read-only for now — the green Edit/Save controls per Figma land in a later phase.
function StatusRow({ status }) {
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

function ItemList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-gray-700">
          <span className="flex-1">{item.text}</span>
          <span className="flex items-center gap-3 text-xs text-gray-400 whitespace-nowrap">Target Date: {item.target_date || "__________"}</span>
          <StatusRow status={item.status} />
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

function CarePlanSection({ section, index, open, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="font-medium text-gray-800">
          {index + 1}. {section.title}
        </span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4 text-sm">
          {SUBSECTIONS.map((sub) => {
            const value = section[sub.key];
            if (sub.type === "text" && !value) return null;
            if ((sub.type === "items" || sub.type === "text-list") && !value?.length) return null;

            return (
              <div key={sub.key}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{sub.label}</h4>
                {sub.type === "text" && <p className="text-gray-700">{value}</p>}
                {sub.type === "text-list" && (
                  <ul className="list-disc space-y-1 pl-4 text-gray-700">
                    {value.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
                {sub.type === "items" && <ItemList items={value} />}
              </div>
            );
          })}

          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Assessment of Progress</h4>
            <p className="mb-2 text-xs text-gray-400">
              Care Manager documents progress toward each goal and completion of each intervention at every contact.
            </p>
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
                {(section.assessment_of_progress?.length ? section.assessment_of_progress : [{}]).map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-200 px-2 py-1">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1">&nbsp;</td>
                    <td className="border border-gray-200 px-2 py-1">&nbsp;</td>
                  </tr>
                ))}
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
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientKey = getPatientKey(singleData?.patient_name, singleData?.patient_type);
  const { generate, isStarting, error: startError } = useCarePlan();
  const { status, progress, message, carePlanId, carePlanData: statusCarePlanData } = useCarePlanStatus(patientKey);
  const [openIndex, setOpenIndex] = useState(0);

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
  const patient = carePlanData?.patient;
  const sections = carePlanData?.sections || [];

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Care Plan
        </button>
        <h3 className="font-semibold text-gray-800">Care Plan{patient?.name ? ` — ${patient.name}` : ""}</h3>
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
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs text-gray-500">Patient Name</span>
                <p className="text-gray-800">{patient?.name || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Primary Care Provider</span>
                <p className="text-gray-800">{patient?.primary_care_provider || "________"}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-gray-500">Diagnosis</span>
                <p className="text-gray-800">{patient?.diagnosis || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Plan Start Date</span>
                <p className="text-gray-800">{patient?.plan_start_date || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Plan End Date</span>
                <p className="text-gray-800">{patient?.plan_end_date || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Date Acknowledged by Patient</span>
                <p className="text-gray-800">{patient?.date_acknowledged_by_patient || "________"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Next Follow-up Date</span>
                <p className="text-gray-800">{patient?.next_follow_up_date || "________"}</p>
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

            {sections.map((section, i) => (
              <CarePlanSection key={i} section={section} index={i} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
