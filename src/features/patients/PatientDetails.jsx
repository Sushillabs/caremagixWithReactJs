import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, User } from "lucide-react";
import useAskQuestion from "../../hooks/useAskQuestion";
import { addDischargePatientDate } from "../../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat, setMode } from "../../redux/chatSlice";
import { clearNotes, fetchDischargePlan } from "../../redux/notesSlice";
import RegisterCallModal from "./RegisterCallModal";
import UnregisterCallModal from "./UnregisterCallModal";
import UploadPlanModal from "./UploadPlanModal";
import OasisSocModal from "./OasisSocModal";
import EditTemplate from "../../components/EditTemplate";
import useCan from "../../hooks/useCan";
import WellnessCheckInPanel from "../wellness/WellnessCheckInPanel";
import AppointmentsPanel from "../appointments/AppointmentsPanel";

let DOCUMENT_ITEMS = [];

const NOTES_ITEMS = ["Create Visit Notes AI", "Edit Visit Template"]; //"Create Visit Notes"

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
  const [showOasisSocModal, setShowOasisSocModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  // Wellness Check-in renders inline in place of the routed Outlet content —
  // same "swap the content area" pattern the Medication button already uses
  // (see setMode below), not a new route.
  const [activePanel, setActivePanel] = useState(null);
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient = singleData?.patient;
  const type = patient?.type;
  const auth = useSelector((state) => state.auth?.value) || {};
  const caregiverName = `${auth.first_name || ""} ${auth.last_name || ""}`.trim() || auth.name || auth.username || "";

  const age = patient?.raw?.age || patient?.age || "";
  const admissionDate = patient?.raw?.admission_date || patient?.admissionDate || "";
  const isCallRegistered = patient?.raw?.call_registered;

  const canDocuments = useCan("documents");
  const canPlan = useCan("plan");
  const canForms = useCan("forms");
  const canUpload = useCan("upload");
  const canMmta = useCan("mmta");
  const canRegisterCall = useCan("registerCall");
  const canMedicationAlerts = useCan("medicationAlerts");
  const canMedication = useCan("medication");
  const canPatientJourney = useCan("patientJourney");
  const canNotes = useCan("notes");
  const canCreateCarePlan = useCan("createCarePlan");
  const canWellnessCheckIn = useCan("wellnessCheckIn");
  const canBookAppointment = useCan("bookAppointment");

  if (type === "Uploaded") {
    DOCUMENT_ITEMS = patient?.raw?.data.map((item) => item?.dates);
  } else {
    DOCUMENT_ITEMS = [...patient?.details];
  }

  const handleUploadItemClick = (item) => {
    if (item === "Upload PDF") setUploadModalMode("pdf");
    if (item === "Upload Scan PDF") setUploadModalMode("scan");
  };

  const handleFormsItemClick = (item) => {
    if (item === "OASIS-SOC") setShowOasisSocModal(true);
    // Other Forms items intentionally left unhandled for now — not built yet
  };

  const handleNotesItemClick = (item) => {
    if (item === "Create Visit Notes") {
      dispatch(clearNotes());
      dispatch(
        fetchDischargePlan({
          action: "get_template",
          patient_name: singleData?.patient_name,
          patient_type: singleData?.patient_type,
        })
      );
      navigate("visit-notes");
    }
    if (item === "Create Visit Notes AI") {
      navigate("visit-notes-ai");
    }
    if (item === "Edit Visit Template") {
      setShowEditTemplateModal(true);
    }
  };

  const handleDocumentClick = (item) => {
    let payload = null;
    if (type === "Uploaded") {
      payload = { ...singleData, dates: item, patient_date: item };
    } else {
      payload = { ...singleData, patient_collection: item };
    }

    setActivePanel(null);
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
          {canDocuments && <DropdownButton label="Documents" items={DOCUMENT_ITEMS} onItemClick={handleDocumentClick} />}
          {canNotes && <DropdownButton label="Notes" items={NOTES_ITEMS} onItemClick={handleNotesItemClick} />}
          {canPlan && <DropdownButton label="Plan" items={PLAN_ITEMS} />}
          {canForms && <DropdownButton label="Forms" items={FORMS_ITEMS} onItemClick={handleFormsItemClick} />}
          {canUpload && <DropdownButton label="Upload" items={UPLOAD_ITEMS} onItemClick={handleUploadItemClick} />}
          {canMmta && (
            <button
              type="button"
              onClick={() => navigate("mmta")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              MMTA
            </button>
          )}
          {canRegisterCall && type === "Uploaded" && (
            <button
              type="button"
              onClick={() => (isCallRegistered ? setShowUnregisterModal(true) : setShowCallModal(true))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              {isCallRegistered ? "Unregister Call" : "Register a Call"}
            </button>
          )}
          {canMedicationAlerts && (
            <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
              Medication Alerts
            </button>
          )}
          {/* <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Call Reports
          </button> */}
          {canMedication && (
            <button
              type="button"
              onClick={() => {
                setActivePanel(null);
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
          )}
          {canPatientJourney && (
            <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
              Patient Journey
            </button>
          )}
          {canCreateCarePlan && (
            <button
              type="button"
              onClick={() => {
                setActivePanel(null);
                navigate("care-plan");
              }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Create Care Plan
            </button>
          )}
          {canWellnessCheckIn && (
            <button
              type="button"
              onClick={() => setActivePanel("wellness")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Wellness Check-in
            </button>
          )}

          {canBookAppointment && (
            <button
              type="button"
              onClick={() => setActivePanel("appointments")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Book Physician Visit
            </button>
          )}
        </div>
      </div>

      {activePanel === "wellness" ? <WellnessCheckInPanel /> : activePanel === "appointments" ? <AppointmentsPanel /> : <Outlet />}

      {showCallModal && <RegisterCallModal onClose={() => setShowCallModal(false)} />}
      {showUnregisterModal && <UnregisterCallModal onClose={() => setShowUnregisterModal(false)} />}
      {uploadModalMode && <UploadPlanModal mode={uploadModalMode} onClose={() => setUploadModalMode(null)} />}
      {showOasisSocModal && <OasisSocModal patientName={patient?.name} onClose={() => setShowOasisSocModal(false)} />}
      {showEditTemplateModal && <EditTemplate onClose={() => setShowEditTemplateModal(false)} />}
    </div>
  );
}
