import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getProgress } from "../api/hospitalApi";

export default function useCarePlanStatus(patientKey) {
  const carePlanJobs = useSelector((state) => state.jobsId.carePlanJobs) || [];
  const finalJobs = useSelector((state) => state.finalJobStatus.finalJobs) || [];

  const finalForPatient = [...finalJobs].reverse().find((f) => f.patientKey === patientKey);

  // Most recent job started for this patient that hasn't been finalized yet.
  const runningJob = [...carePlanJobs].reverse().find((j) => j.patientKey === patientKey && !finalJobs.some((f) => f.jobId === j.job_id));

  const { data: liveData } = useQuery({
    queryKey: ["job-progress", "care-plan-job", runningJob?.job_id],
    queryFn: () => getProgress(runningJob.job_id),
    enabled: !!runningJob?.job_id,
    staleTime: Infinity,
  });

  if (runningJob) {
    return { status: "running", progress: liveData?.progress ?? 0, message: liveData?.message };
  }

  if (finalForPatient) {
    if (finalForPatient.status === "FAILED") {
      return { status: "failed", message: finalForPatient.message };
    }
    return { status: "done", carePlanId: finalForPatient.carePlanId, carePlanData: finalForPatient.carePlanData };
  }

  return { status: "idle" };
}
