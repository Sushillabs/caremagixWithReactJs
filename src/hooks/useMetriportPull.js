import useJobPull from "./useJobPull";
import { pullMetriportPatients, getMetriportPullStatus } from "../api/hospitalApi";

// Unlike PCC/Epic's bare GET, Metriport's start call needs a body — closed
// over here so useJobPull itself stays call-with-no-args generic.
const useMetriportPull = () =>
  useJobPull({
    startFn: () => pullMetriportPatients({ pull_all: true, max_patients: 100, async: true }),
    statusFn: getMetriportPullStatus,
    toastId: "metriport-toast",
    defaultMsg: "Pulling Metriport data...",
    jobsSliceKey: "metriportJobs",
  });

export default useMetriportPull;
