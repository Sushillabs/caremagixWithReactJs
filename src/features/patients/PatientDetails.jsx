import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, User } from "lucide-react";
import useAskQuestion from "../../hooks/useAskQuestion";
import { addDischargePatientDate } from "../../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat, setMode } from "../../redux/chatSlice";
import RegisterCallModal from "./RegisterCallModal";
import UnregisterCallModal from "./UnregisterCallModal";
import UploadPlanModal from "./UploadPlanModal";

let DOCUMENT_ITEMS = [];

const NOTES_ITEMS = ["Visit notes", "Create Progress Notes"];

const PLAN_ITEMS = ["Discharge Plan", "Create Discharge Plan", "Nursing Plan", "Transition-Care Plan"];

const FORMS_ITEMS = ["CMS-485", "OASIS-FU", "OASIS-ROC", "OASIS-SOC", "OASIS-DAH", "OASIS-TRN"];

const UPLOAD_ITEMS = ["Upload PDF", "Upload Scan PDF"];

function DropdownButton({ label, items, onItemClick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
      >
        {label}
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <ul className="absolute h-60 overflow-y-auto right-0 top-full z-10 mt-1 w-52 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-md">
          {items.map((item) => (
            <li
              key={item}
              onClick={() => {
                setOpen(false);
                onItemClick?.(item);
              }}
              className="cursor-pointer px-3 py-1.5 text-gray-600 hover:bg-gray-50"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PatientDetails() {
  const { askQuestion } = useAskQuestion();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showCallModal, setShowCallModal] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [uploadModalMode, setUploadModalMode] = useState(null);
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient = singleData?.patient;
  const type = patient?.type;
  const auth = useSelector((state) => state.auth?.value) || {};
  const caregiverName = `${auth.first_name || ""} ${auth.last_name || ""}`.trim() || auth.name || auth.username || "";

  const age = patient?.raw?.age || patient?.age || "";
  const admissionDate = patient?.raw?.admission_date || patient?.admissionDate || "";
  const isCallRegistered = patient?.raw?.call_registered;

  if (type === "Uploaded") {
    DOCUMENT_ITEMS = patient?.raw?.data.map((item) => item?.dates);
  } else {
    DOCUMENT_ITEMS = [...patient?.details];
  }

  const handleUploadItemClick = (item) => {
    if (item === "Upload PDF") setUploadModalMode("pdf");
    if (item === "Upload Scan PDF") setUploadModalMode("scan");
  };

  const handleDocumentClick = (item) => {
    let payload = null;
    if (type === "Uploaded") {
      payload = { ...singleData, dates: item, patient_date: item };
    } else {
      payload = { ...singleData, patient_collection: item };
    }

    dispatch(clearChat());
    dispatch(addDischargePatientDate(payload));
    dispatch(fetchPatientChat(payload));
    navigate(".");
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-4 items-center justify-between gap-3 ">
        <div className="col-span-1 flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <User size={18} className="text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-800">{patient?.name || "Patient"}</h2>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Age: {age} &nbsp;&nbsp; Admission Date: {admissionDate}
            </p>
            <p className="text-xs  text-gray-500">Caregiver name: {caregiverName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 col-span-3 text-xs">
          <DropdownButton label="Documents" items={DOCUMENT_ITEMS} onItemClick={handleDocumentClick} />
          <DropdownButton label="Notes" items={NOTES_ITEMS} />
          <DropdownButton label="Plan" items={PLAN_ITEMS} />
          <DropdownButton label="Forms" items={FORMS_ITEMS} />
          <DropdownButton label="Upload" items={UPLOAD_ITEMS} onItemClick={handleUploadItemClick} />
          <button
            type="button"
            onClick={() => navigate("mmta")}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            MMTA
          </button>
          {type === "Uploaded" && (
            <button
              type="button"
              onClick={() => (isCallRegistered ? setShowUnregisterModal(true) : setShowCallModal(true))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              {isCallRegistered ? "Unregister Call" : "Register a Call"}
            </button>
          )}
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Medication Alerts
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Call Reports
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(clearChat());
              dispatch(setMode("medication"));
              askQuestion(
                "What specific medications were prescribed to the patient, along with their intended uses, potential side effects and Medication schedule in tabular format?"
              );
            }}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            Medication
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Patient Journey
          </button>
          <button
            type="button"
            onClick={() => navigate("care-plan")}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            Create Care Plan
          </button>
        </div>
      </div>

      <Outlet />

      {showCallModal && <RegisterCallModal onClose={() => setShowCallModal(false)} />}
      {showUnregisterModal && <UnregisterCallModal onClose={() => setShowUnregisterModal(false)} />}
      {uploadModalMode && <UploadPlanModal mode={uploadModalMode} onClose={() => setUploadModalMode(null)} />}
    </div>
  );
}
