import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCarePlanStatus from "../../hooks/useCarePlanStatus";
import useCarePlan from "../../hooks/useCarePlan";
import { getPatientKey } from "../../utils/buildPatientPayload";

export default function CarePlan() {
  const navigate = useNavigate();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientKey = getPatientKey(singleData?.patient_name, singleData?.patient_type);
  const { status, progress } = useCarePlanStatus(patientKey);
  const { generate, isStarting } = useCarePlan();

  const handleClick = async () => {
    if (status === "idle") {
      await generate({
        patient_name: singleData?.patient_name,
        patient_type: singleData?.patient_type,
        doc_title: singleData?.dates || singleData?.patient_collection,
        regenerate: false,
      });
    }
    navigate("view");
  };

  const buttonLabel = isStarting
    ? "Starting..."
    : status === "running"
    ? `Generating... ${progress}%`
    : status === "done"
    ? "View Care Plan"
    : "Create Care Plan";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4] text-xs">
        <h3 className="text-xs font-bold text-gray-800">Care Plan</h3>
        <button
          type="button"
          onClick={handleClick}
          disabled={isStarting}
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div>Care Plan Dashboard</div>
      </div>
    </div>
  );
}
