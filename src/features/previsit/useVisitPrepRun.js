import { useQueries, useQuery } from "@tanstack/react-query";
import { getExamPlanRun, getPrevisitRun } from "./previsitApi";

const POLL_MS = 8000;

export const isRunDone = (run) => run?.status === "completed" || run?.status === "failed";

const PREVISIT_STEPS = {
  queued: { text: "Waiting to start...", progress: 5 },
  collecting: { text: "Collecting records...", progress: 30 },
  retrieving: { text: "Reading documents...", progress: 60 },
};

export function previsitProgress(run) {
  if (run?.status === "completed") return { text: "Brief ready", progress: 100 };
  if (run?.status === "failed") return { text: run.error || "Brief failed", progress: 0 };
  return PREVISIT_STEPS[run?.status] || { text: "Preparing brief...", progress: 80 };
}

export function examPlanProgress(run) {
  const status = run?.status || "";
  if (status === "completed") return { text: "Exam plan ready", progress: 100 };
  if (status === "failed") return { text: run.error || "Exam plan failed", progress: 0 };
  if (status === "queued") return { text: "Waiting to start...", progress: 5 };
  if (status === "load_context" || status === "retrieving") return { text: "Reading visit and records...", progress: 25 };
  if (status.startsWith("red_flag:")) return { text: `Checking ${status.split(":")[2] || "risk flags"}...`, progress: 55 };
  return { text: "Finishing plan...", progress: 85 };
}

// kind: "previsit" or "examPlan". Panel and Jobs page use the same key, so React Query polls once.
const runQuery = (kind, runId) => ({
  queryKey: [kind, "run", runId],
  queryFn: () => (kind === "previsit" ? getPrevisitRun(runId) : getExamPlanRun(runId)),
  enabled: !!runId,
  retry: false,
  staleTime: 0,
  refetchInterval: (query) => (isRunDone(query.state.data) || query.state.status === "error" ? false : POLL_MS),
});

export function useVisitPrepRun(kind, runId) {
  return useQuery(runQuery(kind, runId));
}

export function useVisitPrepRuns(kind, jobs = []) {
  return useQueries({ queries: jobs.map((job) => runQuery(kind, job.job_id)) });
}
