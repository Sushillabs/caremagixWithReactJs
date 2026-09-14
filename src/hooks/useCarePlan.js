import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { generateCarePlan, regenerateCarePlan } from "../api/hospitalApi";
import { setJobsId } from "../redux/jobsIdslice";
import { saveFinalJobStatus } from "../redux/finalJobsStatusSlice";
import { getPatientKey } from "../utils/buildPatientPayload";

const TOAST_ID = "care-plan-toast";

const useCarePlan = () => {
  const dispatch = useDispatch();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(
    async ({ patient_name, patient_type, days, doc_title, regenerate = true }) => {
      setError(null);
      setIsStarting(true);
      toast.loading("Generating care plan...", { id: TOAST_ID });
      const patientKey = getPatientKey(patient_name, patient_type);

      try {
        const response = await generateCarePlan({ patient_name, patient_type, days, doc_title, regenerate });

        // regenerate: false + already exists -> immediate result, no job to track
        if (response?.care_plan_data) {
          dispatch(
            saveFinalJobStatus({
              jobId: `immediate-${response.care_plan_id}`,
              status: "COMPLETED",
              message: "Care plan loaded",
              carePlanId: response.care_plan_id,
              carePlanData: response.care_plan_data,
              patientKey,
            })
          );
          setIsStarting(false);
          toast.success("Care plan loaded", { id: TOAST_ID });
          return;
        }

        if (response?.job_id) {
          dispatch(
            setJobsId({
              carePlanJobs: { job_id: response.job_id, patientKey, patient_name, patient_type },
            })
          );
          setIsStarting(false);
          toast.dismiss(TOAST_ID);
          return;
        }

        const errMsg = response?.error || "Failed to start care plan generation";
        setError(errMsg);
        toast.error(errMsg, { id: TOAST_ID });
      } catch (err) {
        const errMsg = err?.response?.data?.error || err?.message || "Server error occurred";
        setError(errMsg);
        toast.error(errMsg, { id: TOAST_ID });
      } finally {
        setIsStarting(false);
      }
    },
    [dispatch]
  );

  // Regenerate produces a NEW plan (version + 1) linked back to care_plan_id;
  // the old one stays as read-only history, is_active flips server-side. Same
  // job-tracking dispatch as generate — carePlanJobs/finalJobs are keyed by
  // patientKey, not by the old plan's id, so useCarePlanStatus picks up the
  // new plan automatically once the job completes.
  const regenerate = useCallback(
    async ({ care_plan_id, patient_name, patient_type, days, doc_title }) => {
      setError(null);
      setIsStarting(true);
      toast.loading("Regenerating care plan...", { id: TOAST_ID });
      const patientKey = getPatientKey(patient_name, patient_type);

      try {
        const response = await regenerateCarePlan(care_plan_id, { days, doc_title });

        if (response?.job_id) {
          dispatch(
            setJobsId({
              carePlanJobs: { job_id: response.job_id, patientKey, patient_name, patient_type },
            })
          );
          setIsStarting(false);
          toast.dismiss(TOAST_ID);
          return;
        }

        const errMsg = response?.error || "Failed to start care plan regeneration";
        setError(errMsg);
        toast.error(errMsg, { id: TOAST_ID });
      } catch (err) {
        const errMsg = err?.response?.data?.error || err?.message || "Server error occurred";
        setError(errMsg);
        toast.error(errMsg, { id: TOAST_ID });
      } finally {
        setIsStarting(false);
      }
    },
    [dispatch]
  );

  return { generate, regenerate, isStarting, error };
};

export default useCarePlan;
