import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setJobsId } from "../../redux/jobsIdslice";
import { startCms485Fill } from "./api/cms485Api";

export default function useCms485Fill() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [formLink, setFormLink] = useState(null);
  const [error, setError] = useState(null);

  const start = useCallback(
    async ({ patient_name, patient_type, dates, regenerate = false }) => {
      if (isStarting) return;
      setIsStarting(true);
      setError(null);
      setFormLink(null);

      try {
        const res = await startCms485Fill({ form_name: "CMS-485", patient_name, patient_type, dates, regenerate });

        if (res?.cached && res?.form_link) {
          setFormLink(res.form_link);
          return;
        }

        if (res?.job_id) {
          dispatch(setJobsId({ cms485Jobs: { job_id: res.job_id, patient_name: res.patient_name || patient_name } }));
          toast.success("Plan of Care is being filled. Track it here.", { id: "cms485-toast" });
          navigate("/app/jobs");
          return;
        }

        setError(res?.error || res?.message || "Could not start filling the form. Please try again.");
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Could not start filling the form. Please try again."
        );
      } finally {
        setIsStarting(false);
      }
    },
    [isStarting, dispatch, navigate]
  );

  return { start, isStarting, formLink, error };
}
