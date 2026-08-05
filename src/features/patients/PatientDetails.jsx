import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, Trash2, Download, Eye, MessageSquare, History, User } from "lucide-react";
import { Spinner } from "../../components/Spiner";
import useAskQuestion from "../../hooks/useAskQuestion";

const markdownTableComponents = {
  table: ({ children }) => <table className="min-w-full border-collapse text-xs">{children}</table>,
  thead: ({ children }) => <thead className="bg-emerald-50 text-left text-gray-700">{children}</thead>,
  th: ({ children }) => <th className="border border-gray-200 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="whitespace-pre-line border border-gray-200 px-3 py-2 align-top text-gray-600">{children}</td>,
};

const DOCUMENT_ITEMS = [
  "Consolidated Med Summary",
  "Family Member History",
  "Observation",
  "Appointments",
  "Consent",
  "Conditions",
  "CarePlan-Outpatient",
  "CarePlan-Inpatient",
  "Device-Information",
  "Diagnostic Report",
  "Clinical-Notes",
  "Patient-Information",
];

const NOTES_ITEMS = ["Visit notes", "Create Progress Notes"];

const PLAN_ITEMS = ["Discharge Plan", "Create Discharge Plan", "Nursing Plan", "Transition-Care Plan"];

const FORMS_ITEMS = ["CMS-485", "OASIS-FU", "OASIS-ROC", "OASIS-SOC", "OASIS-DAH", "OASIS-TRN"];

const UPLOAD_ITEMS = ["Uploaded Plans", "Upload Plans", "Upload via Image"];

function DropdownButton({ label, items }) {
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
        <ul className="absolute right-0 top-full z-10 mt-1 w-52 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-md">
          {items.map((item) => (
            <li key={item} className="cursor-pointer px-3 py-1.5 text-gray-600 hover:bg-gray-50">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TABS = [
  { key: "conversation", label: "Conversation" },
  { key: "summary", label: "Summary" },
  { key: "history", label: "Chat History" },
];

export default function PatientDetails() {
  const [activeTab, setActiveTab] = useState("conversation");
  // patientsingledata is the legacy-shaped payload (buildPatientPayload) —
  // the full normalized patient object lives under .patient
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patient = singleData?.patient;
  const { data: chatData, loading: chatLoading, error: chatError } = useSelector((state) => state.askQ) || {};
  const conversation = useSelector((state) => state.askQ?.value) || [];
  const { askQuestion, isPending: askPending } = useAskQuestion();
  const questionsRef = useRef(null);
  const scrollToQuestions = () => questionsRef.current?.scrollIntoView({ behavior: "smooth" });
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, askPending]);
  const summaryTable = chatData?.[0];
  // index 0 is the summary table, the last item is the MMTA question (not shown here), everything between is the default question list
  const defaultQuestions = chatData?.length > 2 ? chatData.slice(1, -1) : [];
  const auth = useSelector((state) => state.auth?.value) || {};
  const caregiverName = `${auth.first_name || ""} ${auth.last_name || ""}`.trim() || auth.name || auth.username || "";

  const age = patient?.raw?.age || patient?.age || "";
  const admissionDate = patient?.raw?.admission_date || patient?.admissionDate || "";

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
          <DropdownButton label="Documents" items={DOCUMENT_ITEMS} />
          <DropdownButton label="Notes" items={NOTES_ITEMS} />
          <DropdownButton label="Plan" items={PLAN_ITEMS} />
          <DropdownButton label="Forms" items={FORMS_ITEMS} />
          <DropdownButton label="Upload" items={UPLOAD_ITEMS} />
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            MMTA
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Register a Call
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Medication Alerts
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Call Reports
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Medication
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Patient Journey
          </button>
          <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
            Create Care Plan
          </button>
        </div>
      </div>
      {/* chat */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
          <div>
            <h3 className="text-xs font-bold text-gray-800">Discharged Plan</h3>
            <p className="text-xs text-gray-400">Generated on —</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 ">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={activeTab === tab.key ? "font-medium text-emerald-600" : "text-gray-500 hover:text-gray-700"}
              >
                {tab.label}
              </button>
            ))}
            {/* <button type="button" className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button> */}
            <button type="button" className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700">
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {chatLoading ? (
            <Spinner />
          ) : chatError ? (
            <p className="mt-3 text-sm text-red-600">Error: {chatError}</p>
          ) : activeTab === "summary" ? (
            summaryTable ? (
              <div className="mt-3 overflow-x-auto px-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownTableComponents}>
                  {summaryTable}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="mt-3 px-2 text-sm text-gray-400">No summary available yet.</p>
            )
          ) : activeTab === "history" ? (
            <p className="mt-3 px-2 text-sm text-gray-400">Chat History will be built in a later phase.</p>
          ) : defaultQuestions.length > 0 || conversation.length > 0 ? (
            <div className="mt-3 space-y-3 px-2 text-sm">
              {defaultQuestions.length > 0 && (
                <div>
                  <p className="mb-2 text-gray-700" ref={questionsRef}>
                    Welcome!! Try asking me questions related to Discharged Plan. You can ask questions like:
                  </p>
                  <ul className="space-y-1">
                    {defaultQuestions.map((q, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          disabled={askPending}
                          onClick={() => askQuestion(q)}
                          className="flex items-start gap-2 text-left text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {conversation.length > 0 && (
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  {conversation.map((msg, i) =>
                    msg.role === "user" ? (
                      <div key={i} className="flex items-start justify-end gap-2 text-right">
                        <span className="text-gray-700">{msg.content}</span>
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                          A
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="text-gray-700 space-x-2">
                        {typeof msg.content === "string" && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownTableComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                        <button type="button" className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-100">
                          Doc Reference
                        </button>
                        <button
                          type="button"
                          className="mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs tex-gray-700 hover:bg-gray-200"
                          onClick={scrollToQuestions}
                        >
                          Quich Questions
                        </button>
                      </div>
                    )
                  )}
                  {askPending && <p className="text-xs text-gray-400">Thinking...</p>}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 px-2 text-sm text-gray-400">Document content will render here in a later.</p>
          )}
        </div>
      </div>
    </div>
  );
}
