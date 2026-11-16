import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setJobsId } from "../../redux/jobsIdslice";
import { getLatestExamPlan, startExamPlan, toPatientKey } from "./previsitApi";
import { isRunDone, useVisitPrepRun } from "./useVisitPrepRun";

function startErrorText(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || "";
  if (status === 503) return "Service busy. Please try again in a moment.";
  if (status === 403) return "Physician access required";
  if (message.startsWith("No completed pre-visit brief")) return "Generate the Pre-Visit Brief first.";
  if (message.startsWith("No Ambient AI conversation")) return "Record the visit with Ambient AI first.";
  if (message.startsWith("Ambient session not found")) return "Visit recording expired. Record again.";
  if (message.startsWith("Ambient session has no transcript")) return "Visit recording is empty.";
  return message || err?.message || "Could not start the exam plan";
}

export default function useExamPlanJob(patientName, visit) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const patientKey = toPatientKey(patientName);
  const jobs = useSelector((state) => state.jobsId.examPlanJobs) || [];
  const lastJob = [...jobs].reverse().find((job) => job.patient_key === patientKey);

  const [cachedResult, setCachedResult] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const latest = useQuery({
    queryKey: ["examPlan", "latest", patientKey],
    queryFn: () => getLatestExamPlan(patientKey),
    enabled: !!patientKey,
    retry: false,
    staleTime: 0,
  });

  const runQuery = useVisitPrepRun("examPlan", lastJob?.job_id);
  const run = runQuery.data;
  const isRunning = !!lastJob && !runQuery.isError && !isRunDone(run);

  useEffect(() => {
    if (run?.status === "completed") queryClient.invalidateQueries({ queryKey: ["examPlan", "latest", patientKey] });
  }, [run?.status, patientKey, queryClient]);

  const generate = async () => {
    setStartError(null);
    setCachedResult(null);
    setIsStarting(true);
    try {
      const res = await startExamPlan({
        patient_name: patientName,
        ...(visit?.session_id ? { ambient_session_id: visit.session_id } : {}),
      });
      if (res?.status === "completed" && res.visit_plan) {
        setCachedResult(res);
      } else if (res?.run_id) {
        dispatch(setJobsId({ examPlanJobs: { job_id: res.run_id, patient_name: patientName, patient_key: patientKey } }));
      }
    } catch (err) {
      setStartError(startErrorText(err));
    } finally {
      setIsStarting(false);
    }
  };

  const result = cachedResult || (run?.status === "completed" ? run : null) || latest.data;

  let error = startError;
  if (!error && run?.status === "failed" && !cachedResult) error = run.error || "Exam plan failed. Please try again.";
  if (!error && runQuery.isError) error = "Could not check the exam plan status. Please try again.";
  if (!error && latest.isError && latest.error?.response?.status !== 404) {
    error = latest.error?.response?.data?.message || "Could not load the exam plan";
  }

  return {
    plan: result?.visit_plan,
    run,
    isLoading: latest.isLoading,
    isStarting,
    isRunning,
    error,
    generate,
  };
}
