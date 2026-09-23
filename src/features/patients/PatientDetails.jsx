import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, Home, User } from "lucide-react";
import useAskQuestion from "../../hooks/useAskQuestion";
import { addDischargePatientDate } from "../../redux/PatientSingleDateSlice";
import { clearChat, fetchPatientChat, setMode, restoreInitialChat } from "../../redux/chatSlice";
import { clearNotes, fetchDischargePlan } from "../../redux/notesSlice";
import RegisterCallModal from "./RegisterCallModal";
import UnregisterCallModal from "./UnregisterCallModal";
import UploadPlanModal from "./UploadPlanModal";
import OasisSocModal from "./OasisSocModal";
import TransitionCarePlanModal from "./TransitionCarePlanModal";
import EditTemplate from "../../components/EditTemplate";
import useCan from "../../hooks/useCan";
import WellnessCheckInPanel from "../wellness/WellnessCheckInPanel";
import WellnessCaregiverPanel from "../wellness/WellnessCaregiverPanel";
import WellnessQuestionsPanel from "../wellness/WellnessQuestionsPanel";
import AppointmentsPanel from "../appointments/AppointmentsPanel";
import PatientTimelinePanel from "../timeline/PatientTimelinePanel";
import PhysicianAmbientAiPanel from "./PhysicianAmbientAiPanel";
import TherapyProgressNotePanel from "./TherapyProgressNotePanel";
import SendMessageModal from "./SendMessageModal";

let DOCUMENT_ITEMS = [];

const NOTES_ITEMS = [
  { label: "Create Visit Notes AI", roles: ["caregiver"] },
  { label: "Create Discharge Plan AI", roles: ["physician"] },
  // { label: "Create Handoff Note AI", roles: ["physician"] },
]; //"Create Visit Notes"

// AI (ambient) note menu label -> ?kind= for the visit-notes-ai route
const AI_NOTE_KINDS = {
  "Create Discharge Plan AI": "discharge",
  "Create Handoff Note AI": "handoff",
};

const PLAN_ITEMS = ["Nursing Plan", "Transition-Care Plan"];

const FORMS_ITEMS = ["CMS-485", "OASIS-FU", "OASIS-ROC", "OASIS-SOC", "OASIS-DAH", "OASIS-TRN"];

const UPLOAD_ITEMS = [{ label: "Upload PDF" }, { label: "Upload Scan PDF" }];

const byRole = (items, role) => items.filter((item) => !item.roles || item.roles.includes(role)).map((item) => item.label);

function DropdownButton({ label, items, onItemClick, open, onToggle, onClose, disabled }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!boxRef.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onToggle}
        className={
          disabled
            ? "flex cursor-not-allowed items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-300"
            : "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
        }
      >
        {label}
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {!disabled && open && (
        <ul className="absolute h-60 overflow-y-auto right-0 top-full z-10 mt-1 w-52 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-md">
          {items.map((item) => (
            <li
              key={item}
              onClick={() => {
                onClose();
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
  const [showTransitionCareModal, setShowTransitionCareModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);

  // ?panel=/&tab= (set by useOpenPatientDetail, e.g. a dashboard card) picks
  // which panel opens on load instead of always landing on the default
  // record tab. Read once on mount — same "search param decides the initial
  // view" idiom VisitNotesAI already uses for ?kind=.
  const [searchParams] = useSearchParams();
  const [activePanel, setActivePanel] = useState(() => searchParams.get("panel"));
  const initialPanelTab = searchParams.get("tab");

  // ?tab= stays in the URL after a deep link, so the Wellness Check-in button
  // needs its own tab state plus a remount key — otherwise it re-lands on the
  // deep-linked tab, or does nothing at all when the panel is already open.
  const [wellnessTab, setWellnessTab] = useState(() => searchParams.get("tab"));
  const [wellnessKey, setWellnessKey] = useState(0);

  const openWellnessCheckIn = () => {
    setActivePanel("wellness");
    setWellnessTab("checkin");
    setWellnessKey((k) => k + 1);
  };

  const [homeKey, setHomeKey] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleDropdown = (label) => setOpenDropdown((cur) => (cur === label ? null : label));
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const initialPayload = useSelector((state) => state.askQ?.initialPayload);
  const patient = singleData?.patient;
  const type = patient?.type;
  const auth = useSelector((state) => state.auth?.value) || {};
  const role = auth.role || "caregiver";
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
  const canWellnessCheckInReport = useCan("wellnessCheckInReport");
  const canWellnessQuestionEditor = useCan("wellnessQuestionEditor");
  const canCreateProgressNote = useCan("createProgressNotes");
  const canTimeline = useCan("timeline");
  const canSendMessage = useCan("sendMessage");
  const canAmbientVisitNotes = useCan("ambientVisitNotes");

  if (type === "Uploaded") {
    DOCUMENT_ITEMS = patient?.raw?.data.map((item) => item?.dates);
  } else {
    DOCUMENT_ITEMS = [...patient?.details];
  }

  const handleHome = () => {
    setActivePanel(null);
    dispatch(restoreInitialChat());
    if (initialPayload) dispatch(addDischargePatientDate(initialPayload));
    setHomeKey((k) => k + 1);
    navigate(".");
  };

  const handleUploadItemClick = (item) => {
    if (item === "Upload PDF") setUploadModalMode("pdf");
    if (item === "Upload Scan PDF") setUploadModalMode("scan");
  };

  const handlePlanItemClick = (item) => {
    if (item === "Transition-Care Plan") setShowTransitionCareModal(true);
  };

  const handleFormsItemClick = (item) => {
    if (item === "OASIS-SOC") setShowOasisSocModal(true);
  };

  const handleNotesItemClick = (item) => {
    if (item === "Create Visit Notes") {
      setActivePanel(null);
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
    if (item === "Create Visit Notes AI" || item in AI_NOTE_KINDS) {
      setActivePanel(null);
      const kind = AI_NOTE_KINDS[item];
      navigate(kind ? { pathname: "visit-notes-ai", search: `?kind=${kind}` } : "visit-notes-ai");
    }
    if (item === "Edit Visit Template") {
      setShowEditTemplateModal(true);
    }
  };

  const handleDocumentClick = (item) => {
    let payload = null;
    if (type === "Uploaded") {
      const doc = patient?.raw?.data?.find((d) => d.dates === item);
      payload = {
        ...singleData,
        dates: item,
        patient_date: item,
        patient_type: doc?.patient_type || singleData?.patient_type,
      };
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
        <div className="col-span-1 flex items-center h-16 gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <User size={18} className="text-gray-400" />
          </div>
          <div className="">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-800">{patient?.name || "Patient"}</h2>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
            {/* <p className="mt-0.5 text-xs text-gray-500">
              Age: {age} &nbsp;&nbsp; Admission Date: {admissionDate}
            </p>
            <p className="text-xs  text-gray-500">Caregiver name: {caregiverName}</p> */}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 col-span-3 text-xs">
          <button
            type="button"
            onClick={handleHome}
            title="Back to default view"
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Home size={14} />
            Home
          </button>
          {canDocuments && (
            <DropdownButton
              label="Documents"
              items={DOCUMENT_ITEMS}
              onItemClick={handleDocumentClick}
              open={openDropdown === "Documents"}
              onToggle={() => toggleDropdown("Documents")}
              onClose={() => setOpenDropdown(null)}
            />
          )}
          {canNotes && (
            <DropdownButton
              label="Notes"
              items={byRole(NOTES_ITEMS, role)}
              onItemClick={handleNotesItemClick}
              open={openDropdown === "Notes"}
              onToggle={() => toggleDropdown("Notes")}
              onClose={() => setOpenDropdown(null)}
            />
          )}
          {canPlan && (
            <DropdownButton
              label="Plan"
              items={PLAN_ITEMS}
              onItemClick={handlePlanItemClick}
              open={openDropdown === "Plan"}
              onToggle={() => toggleDropdown("Plan")}
              onClose={() => setOpenDropdown(null)}
              disabled
            />
          )}
          {canForms && (
            <DropdownButton
              label="Forms"
              items={FORMS_ITEMS}
              onItemClick={handleFormsItemClick}
              open={openDropdown === "Forms"}
              onToggle={() => toggleDropdown("Forms")}
              onClose={() => setOpenDropdown(null)}
            />
          )}
          {canUpload && (
            <DropdownButton
              label="Upload"
              items={byRole(UPLOAD_ITEMS, role)}
              onItemClick={handleUploadItemClick}
              open={openDropdown === "Upload"}
              onToggle={() => toggleDropdown("Upload")}
              onClose={() => setOpenDropdown(null)}
            />
          )}
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
          {/* {canMedicationAlerts && (
            <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
              Medication Alerts
            </button>
          )} */}
          {canSendMessage && (
            <button
              type="button"
              onClick={() => setShowSendMessageModal(true)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Send Message
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
                  "What specific medications were prescribed to the patient, along with their intended uses, potential side effects and Medication schedule in tabular format?",
                  {
                    dates: "Consolidated Med Summary",
                    patient_collection: "Consolidated Med Summary",
                    patient_date: "Consolidated Med Summary",
                  }
                );
                navigate(".");
              }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Medication
            </button>
          )}
          {/* {canPatientJourney && (
            <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
              Patient Journey
            </button>
          )} */}
          {canCreateCarePlan && (
            <button
              type="button"
              onClick={() => {
                setActivePanel(null);
                navigate("care-plan");
              }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Care Plan
            </button>
          )}
          {canWellnessCheckIn && (
            <button
              type="button"
              onClick={openWellnessCheckIn}
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

          {canTimeline && (
            <button
              type="button"
              onClick={() => setActivePanel("timeline")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Patient Timeline
            </button>
          )}

          {canAmbientVisitNotes && (
            <button
              type="button"
              onClick={() => setActivePanel("ambientAi")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Ambient AI
            </button>
          )}

          {canWellnessCheckInReport && (
            <button
              type="button"
              onClick={() => setActivePanel("wellnessReport")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Wellness Check-in Report
            </button>
          )}

          {canWellnessQuestionEditor && (
            <button
              type="button"
              onClick={() => setActivePanel("wellnessQuestions")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Wellness Check-in Questions
            </button>
          )}
          {/* {canCreateProgressNote && (
            <button
              type="button"
              onClick={() => setActivePanel("createProgress")}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Create Progress Note
            </button>
          )} */}
        </div>
      </div>

      {activePanel === "wellness" ? (
        <WellnessCheckInPanel
          key={wellnessKey}
          initialTab={wellnessTab}
          onRequestVisit={canBookAppointment ? () => setActivePanel("appointments") : undefined}
        />
      ) : activePanel === "appointments" ? (
        <AppointmentsPanel initialTab={initialPanelTab} />
      ) : activePanel === "wellnessReport" ? (
        <WellnessCaregiverPanel />
      ) : activePanel === "wellnessQuestions" ? (
        <WellnessQuestionsPanel patientName={patient?.name} />
      ) : activePanel === "timeline" ? (
        <PatientTimelinePanel />
      ) : activePanel === "ambientAi" ? (
        <PhysicianAmbientAiPanel />
      ) : activePanel === "createProgress" ? (
        <TherapyProgressNotePanel patientName={patient?.name} />
      ) : (
        <Outlet key={homeKey} />
      )}

      {showCallModal && <RegisterCallModal onClose={() => setShowCallModal(false)} />}
      {showUnregisterModal && <UnregisterCallModal onClose={() => setShowUnregisterModal(false)} />}
      {uploadModalMode && <UploadPlanModal mode={uploadModalMode} onClose={() => setUploadModalMode(null)} />}
      {showOasisSocModal && <OasisSocModal patientName={patient?.name} onClose={() => setShowOasisSocModal(false)} />}
      {showTransitionCareModal && <TransitionCarePlanModal patientName={patient?.name} onClose={() => setShowTransitionCareModal(false)} />}
      {showEditTemplateModal && <EditTemplate onClose={() => setShowEditTemplateModal(false)} />}
      {showSendMessageModal && <SendMessageModal onClose={() => setShowSendMessageModal(false)} />}
    </div>
  );
}
