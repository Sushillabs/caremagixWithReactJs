import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";
import { useVisitPrepRuns } from "./useVisitPrepRun";
import { visibleVisitPrep } from "./visibleVisitPrep";

const STORAGE_KEY = "visit_prep_toasted";

function loadToasted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveToasted(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].slice(-100)));
  } catch {
    // storage blocked: a toast may show again after reload
  }
}

const LABELS = { previsit: "Pre-Visit Brief", examPlan: "Exam Plan" };

export default function useVisitPrepToasts() {
  const navigate = useNavigate();
  const openPatientDetail = useOpenPatientDetail();
  const patients = useSelector((state) => state.patientnames?.value) || [];
  const { previsitJobs = [], examPlanJobs = [] } = useSelector((state) => state.jobsId);
  const toastedRef = useRef(loadToasted());

  const previsitWaiting = previsitJobs.filter((job) => !toastedRef.current.has(job.job_id));
  const examWaiting = examPlanJobs.filter((job) => !toastedRef.current.has(job.job_id));
  const previsitQueries = useVisitPrepRuns("previsit", previsitWaiting);
  const examQueries = useVisitPrepRuns("examPlan", examWaiting);

  const openJob = (job, kind) => {
    const match = patients.find((p) => p.name?.toLowerCase() === job.patient_name?.toLowerCase());
    if (match) openPatientDetail(match, { panel: "visitPrep", tab: kind === "examPlan" ? "exam" : "brief" });
    else navigate("/app/jobs");
  };

  const notify = (job, kind, run) => {
    if (toastedRef.current.has(job.job_id)) return;
    toastedRef.current.add(job.job_id);
    saveToasted(toastedRef.current);
    if (visibleVisitPrep.patientKey === job.patient_key) return;

    const label = LABELS[kind];
    if (run.status === "failed") {
      toast.error(`${label} failed - ${job.patient_name}: ${run.error || "please try again"}`, { id: `vp-${job.job_id}` });
      return;
    }
    toast.success(
      (t) => (
        <span className="flex items-center gap-2 text-sm">
          {label} ready - {job.patient_name}
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              openJob(job, kind);
            }}
            className="font-semibold text-emerald-700 underline"
          >
            Open
          </button>
        </span>
      ),
      { id: `vp-${job.job_id}`, duration: 8000 }
    );
  };

  useEffect(() => {
    previsitQueries.forEach((query, i) => {
      const run = query.data;
      if (run?.status === "completed" || run?.status === "failed") notify(previsitWaiting[i], "previsit", run);
    });
    examQueries.forEach((query, i) => {
      const run = query.data;
      if (run?.status === "completed" || run?.status === "failed") notify(examWaiting[i], "examPlan", run);
    });
  });
}
