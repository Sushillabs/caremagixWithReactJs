import { MdCreate, MdDelete } from "react-icons/md";
import { FaUser, FaUpload, FaRegEdit } from "react-icons/fa";
import { SiReacthookform } from "react-icons/si";
import { GrConfigure } from "react-icons/gr";
import { addButtonNames } from "../redux/bottomButtonsSlice";
import { useDispatch, useSelector } from "react-redux";
import { fillCMS485 } from "../api/hospitalApi";
import toast from "react-hot-toast";
import useMyMutation from "../hooks/useMyMutation";
import usePccPull from "../hooks/usePccPull";
import { FaArrowsSpin } from "react-icons/fa6";
import { clearNotes, fetchDischargePlan } from "../redux/notesSlice";

const BottonConfigButtons = () => {
  const dispatch = useDispatch();
  const patientData = useSelector((state) => state.patientsingledata.value);
  const { id: headerId } = useSelector((state) => state.auth.item);

  const {
    data: CMS_data,
    error: CMS_error,
    isError: CMS_isError,
    isPending: CMS_isPending,
    mutateAsync,
  } = useMyMutation({ api: fillCMS485, toastId: "fillCMS485" });

  const {
    start: startPccPull,
    isRunning: isPccRunning,
    showProgress: showPccProgress,
    progress: pccProgress,
    message: pccMessage,
    error: pccError,
  } = usePccPull();

  let bottom_buttons = [
    { id: "pull-pcc", name: "Pull PCC Data", icon: <FaArrowsSpin />, requirePatient: false },
    { id: "efax-configuration", name: "eFax Configuration", icon: <GrConfigure />, requirePatient: false },
    { id: "upload-plan", name: "Upload Patients Plan", icon: <FaUpload />, requirePatient: false },
    { id: "upload-image", name: "Upload Image", icon: <FaUpload />, requirePatient: false },
    { id: "create-visit-notes", name: "Create Visit Notes", icon: <FaUser />, requirePatient: true },
    { id: "edit-visit-template", name: "Edit Visit Template", icon: <FaRegEdit />, requirePatient: false },
    { id: "fil-cms-485", name: "Fill CMS 485", icon: <SiReacthookform />, requirePatient: true },
    { id: "fil-oasis-e", name: "Fill OASIS-E", icon: <SiReacthookform />, requirePatient: true },
    { id: "create-progress-notes", name: "Create Progress Notes", icon: <MdCreate />, requirePatient: true },
    { id: "upload-icd", name: "Upload ICD Codes", icon: <FaUpload />, requirePatient: false },
    { id: "upload-cpt", name: "Upload CPT Codes", icon: <FaUpload />, requirePatient: false },
    { id: "medication-alert", name: "Medication Alerts", icon: <FaUpload />, requirePatient: true },
    { id: "call-report", name: "Call Reports", icon: <FaUpload />, requirePatient: false },
    { id: "set-caller-id", name: "Set Caller Id", icon: <FaUpload />, requirePatient: false },
    { id: "ai-agent", name: "AI Agent", icon: <FaUser />, requirePatient: false },
    { id: "clear-conversations", name: "Clear Conversations", icon: <MdDelete />, requirePatient: false },
  ];

  const createNotes = async () => {
    dispatch(clearNotes());
    const { patient_name, patient_type } = patientData || {};
    const payload = {
      action: "get_template",
      patient_name,
      patient_type,
    };
    dispatch(fetchDischargePlan(payload));
  };

  const handleLeftButtonClick = async (id) => {
    const button = bottom_buttons.find((btn) => btn.id === id);

    if (button?.requirePatient && !patientData) {
      toast.error("⚠️ Please select a patient", {
        position: "top-center",
      });
      return;
    }

    dispatch(addButtonNames(id));

    switch (id) {
      case "fil-cms-485": {
        try {
          const { patient_name, patient_type, dates } = patientData;

          const payload = {
            form_name: "CMS-485",
            patient_name,
            patient_type,
            dates,
          };

          const res = await mutateAsync(payload);

          if (res?.form_link) {
            window.open(res.form_link, "_blank");
          } else {
            alert("Form link not found in response.");
            console.error("Invalid response:", res);
          }
        } catch (err) {
          console.error("Error generating form:", err);
        }
        break;
      }
      case "pull-pcc":
        startPccPull();
        break;
      case "create-visit-notes":
        createNotes();
        break;
      default:
        console.warn("Unhandled button id:", id);
        break;
    }
  };

  return (
    <ul className="flex flex-col gap-1 overflow-y-auto min-h-0">
      {bottom_buttons &&
        bottom_buttons.map((button) => {
          if (button.id === "upload-icd" && headerId !== "icd_codes") return null;
          if (button.id === "upload-cpt" && headerId !== "cpt_codes") return null;

          const isCMS485 = button.id === "fil-cms-485";
          const isPcc = button.id === "pull-pcc";
          const disabled =
            ((isCMS485 || button.id === "fil-oasis-e") && !patientData) ||
            (isCMS485 && CMS_isPending) ||
            (isPcc && isPccRunning);

          return (
            <li key={button.id} className="flex flex-col gap-0.5">
              <div
                title={
                  disabled
                    ? isPcc
                      ? "PCC pull in progress"
                      : "Please select patient"
                    : ""
                }
                onClick={() => {
                  if (disabled) return;
                  handleLeftButtonClick(button.id);
                }}
                className={`flex items-center gap-1 py-2 px-1
                  ${
                    button.name === "Clear Conversations"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-green-500"
                  }
                  ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:text-white"
                  }
                  border border-green-500 text-gray-700 rounded-md`}
              >
                {button.icon}
                <span>
                  {isCMS485 && CMS_isPending
                    ? "Filling CMS 485..."
                    : isPcc && isPccRunning
                      ? "Pulling PCC Data..."
                      : button.name}
                </span>
              </div>

              {/* PCC job progress — same structure as caremagix-fe #pcc-progress */}
              {isPcc && showPccProgress && (
                <div className="w-full px-1 pb-1">
                  <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1 gap-2">
                    <span className="truncate">{pccMessage}</span>
                    <span className="shrink-0 font-medium text-blue-500">
                      {Math.round(pccProgress)}%
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, pccProgress))}%`,
                      }}
                    />
                  </div>
                  {pccError && (
                    <p className="text-red-500 text-[11px] mt-1">{pccError}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );
};

export default BottonConfigButtons;
