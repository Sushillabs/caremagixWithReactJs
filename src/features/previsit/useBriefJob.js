import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setJobsId } from "../../redux/jobsIdslice";
import { downloadPrevisitPdf, getLatestPrevisit, startPrevisit, toPatientKey } from "./previsitApi";
import { isRunDone, useVisitPrepRun } from "./useVisitPrepRun";

function startErrorText(err) {
  const status = err?.response?.status;
  if (status === 503) return "Service busy. Please try again in a moment.";
  if (status === 403) return "Physician access required";
  return err?.response?.data?.message || err?.message || "Could not start the brief";
}

function pdfErrorText(err) {
  const status = err?.response?.status;
  if (status === 409) return "Brief is not ready yet.";
  if (status === 404) return "No brief found for this patient.";
  return "Could not create the PDF. Please try again.";
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const pdfFileName = (patientKey) =>
  `${patientKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("_")}_Previsit_Brief.pdf`;

export default function useBriefJob(patientName) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const patientKey = toPatientKey(patientName);
  const jobs = useSelector((state) => state.jobsId.previsitJobs) || [];
  const lastJob = [...jobs].reverse().find((job) => job.patient_key === patientKey);

  const [cachedResult, setCachedResult] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const latest = useQuery({
    queryKey: ["previsit", "latest", patientKey],
    queryFn: () => getLatestPrevisit(patientKey),
    enabled: !!patientKey,
    retry: false,
    staleTime: 0,
  });

  const runQuery = useVisitPrepRun("previsit", lastJob?.job_id);
  const run = runQuery.data;
  const isRunning = !!lastJob && !runQuery.isError && !isRunDone(run);

  useEffect(() => {
    if (run?.status === "completed") queryClient.invalidateQueries({ queryKey: ["previsit", "latest", patientKey] });
  }, [run?.status, patientKey, queryClient]);

  const generate = async () => {
    setStartError(null);
    setCachedResult(null);
    setIsStarting(true);
    try {
      const res = await startPrevisit({ patient_name: patientName });
      if (res?.status === "completed" && res.brief) {
        setCachedResult(res);
      } else if (res?.run_id) {
        dispatch(setJobsId({ previsitJobs: { job_id: res.run_id, patient_name: patientName, patient_key: patientKey } }));
      }
    } catch (err) {
      setStartError(startErrorText(err));
    } finally {
      setIsStarting(false);
    }
  };

  const result = cachedResult || (run?.status === "completed" ? run : null) || latest.data;

  const downloadPdf = async () => {
    setPdfError(null);
    setIsDownloading(true);
    try {
      const blob = await downloadPrevisitPdf(result.run_id);
      saveBlob(blob, pdfFileName(patientKey));
    } catch (err) {
      setPdfError(pdfErrorText(err));
    } finally {
      setIsDownloading(false);
    }
  };

  let error = startError || pdfError;
  if (!error && run?.status === "failed" && !cachedResult) error = run.error || "Brief failed. Please try again.";
  if (!error && runQuery.isError) error = "Could not check the brief status. Please try again.";
  if (!error && latest.isError && latest.error?.response?.status !== 404) {
    error = latest.error?.response?.data?.message || "Could not load the brief";
  }

  return {
    brief: result?.brief,
    runId: result?.run_id,
    run,
    isLoading: latest.isLoading,
    isStarting,
    isRunning,
    isDownloading,
    error,
    generate,
    downloadPdf,
  };
}
