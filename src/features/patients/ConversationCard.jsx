import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "../../api/hospitalApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download } from "lucide-react";
import { Spinner } from "../../components/Spiner";
import ChatLoader from "../../components/ChatLoader";
import useAskQuestion from "../../hooks/useAskQuestion";
import { markdownTableComponents } from "../../utils/markdownComponents";
import DocReferenceModal from "./DocReferenceModal";

const TABS = [
  { key: "conversation", label: "Conversation" },
  { key: "summary", label: "Summary" },
  { key: "history", label: "Chat History" },
];

const SOURCE_LABELS = {
  "Discharge Plan": "Discharge Plan",
  Discharged: "Discharge Plan",
  "Nursing Plan": "Nursing Plan",
  "Nursing-Care": "Nursing Plan",
  "Medication Adherence": "Medication Adherence",
  "Medical Adherence": "Medication Adherence",
  care_plan: "Care Plan",
  prescription: "Prescription",
  "Visit Note": "Visit Note",
  OASIS: "OASIS Assessment",
  Efax: "eFax Documents",
  PCC: "PCC Records",
  epic: "EHR Records",
  EHR: "EHR Records",
  metriport: "HIE Records",
  "ICD-Codes": "ICD Codes",
  "CPT-Codes": "CPT Codes",
};

function formatChatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const HIDDEN_QUESTION_KEYWORDS_BY_ROLE = {
  patient: ["progress notes for last 7 days", "h & p", "h&p", "hhrg", "icd"],
};

export default function ConversationCard() {
  const [activeTab, setActiveTab] = useState("conversation");
  const { data: chatData, loading: chatLoading, error: chatError, isAskPending: askPending, mode } = useSelector((state) => state.askQ) || {};
  const conversation = useSelector((state) => state.askQ?.value) || [];
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientType = singleData?.patient?.type;
  const sourceLabel = SOURCE_LABELS[singleData?.patient_type] || singleData?.patient_type || "Discharged Plan";
  const role = useSelector((state) => state.auth?.value?.role) || "caregiver";
  const isMedication = mode === "medication";
  // Medication has no summary table for any role — drop that tab entirely.
  const visibleTabs = isMedication ? TABS.filter((tab) => tab.key !== "summary") : TABS;
  const { askQuestion } = useAskQuestion();
  const [docRefQuestionId, setDocRefQuestionId] = useState(null);
  const questionsRef = useRef(null);
  const scrollToQuestions = () => questionsRef.current?.scrollIntoView({ behavior: "smooth" });
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, askPending]);
  // If medication mode hides the Summary tab while it's active, fall back to Conversation.
  useEffect(() => {
    if (isMedication && activeTab === "summary") setActiveTab("conversation");
  }, [isMedication, activeTab]);
  const latestExchange = conversation.slice(-2);

  // EHR sources are scoped by collection, everything else by document label —
  // mirrors resolve_chat_scope() in the backend.
  const isEhrSource = ["PCC", "epic", "EHR", "metriport"].includes(singleData?.patient_type);
  const historyParams = {
    patient_name: singleData?.patient_name || "",
    patient_type: singleData?.patient_type || "",
    ...(isEhrSource
      ? { patient_collection: singleData?.patient_collection || "Consolidated Med Summary" }
      : { dates: singleData?.dates || "Consolidated Med Summary" }),
  };

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["chatHistory", historyParams],
    queryFn: () => getChatHistory(historyParams),
    enabled: activeTab === "history" && !!singleData?.patient_name,
    staleTime: 0,
  });

  const historyChats = historyData?.chats || [];

  const latestAnswerId = [...conversation].reverse().find((m) => m.role !== "user" && m.id)?.id;

  const renderMessage = (msg, i, showQuickQuestions = true) => {
    // Medication's first message is always the fixed canned question
    if (isMedication && conversation.indexOf(msg) === 0 && msg.role === "user") return null;

    return msg.role === "user" ? (
      <div key={i} className="flex items-start justify-end gap-2 text-right">
        <span className="max-w-[80%] rounded-lg rounded-tr-none bg-emerald-50 px-3 py-2 text-left text-gray-700">{msg.content}</span>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">A</div>
      </div>
    ) : (
      <div key={i} className="text-gray-700 space-x-2">
        <button
          type="button"
          onClick={() => setDocRefQuestionId(msg.id)}
          disabled={!msg.id}
          className="mb-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Doc Reference
        </button>
        {showQuickQuestions && (
          <button
            type="button"
            className="mb-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs tex-gray-700 hover:bg-gray-200"
            onClick={scrollToQuestions}
          >
            Quick Questions
          </button>
        )}
        {typeof msg.content === "string" && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownTableComponents}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    );
  };

  const summaryTable = isMedication ? null : chatData?.[0];
  // index 0 is the summary table, the last item is the MMTA question (not shown here), everything between is the default question list
  const rawDefaultQuestions = !isMedication && chatData?.length > 2 ? chatData.slice(1, -1) : [];
  const hiddenKeywords = HIDDEN_QUESTION_KEYWORDS_BY_ROLE[role] || [];
  const defaultQuestions = hiddenKeywords.length
    ? rawDefaultQuestions.filter((q) => !hiddenKeywords.some((kw) => q.toLowerCase().includes(kw)))
    : rawDefaultQuestions;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-800">{isMedication ? "Medication" : sourceLabel}</h3>
          {latestAnswerId && (
            <button
              type="button"
              onClick={() => setDocRefQuestionId(latestAnswerId)}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 hover:cursor-pointer"
            >
              Doc Reference
            </button>
          )}
          {/* <p className="text-xs text-gray-400">Generated on — xx-xx-xxxx</p> */}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 ">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              className={
                tab.disabled
                  ? "cursor-not-allowed text-gray-300"
                  : activeTab === tab.key
                  ? "font-medium text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }
            >
              {tab.label}
            </button>
          ))}
          {/* <button type="button" className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700">
            <Download size={14} /> Download
          </button> */}
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
          historyLoading ? (
            <Spinner />
          ) : historyError ? (
            <p className="mt-3 px-2 text-sm text-gray-500">
              {historyError?.response?.data?.error || historyError?.message || "Could not load chat history."}
            </p>
          ) : historyChats.length > 0 ? (
            <div className="mt-3 space-y-4 px-2 text-sm">
              {historyChats.map((chat) => (
                <div key={chat.id} className="space-y-3">
                  {renderMessage({ role: "user", content: chat.question }, `${chat.id}-q`, false)}
                  {renderMessage({ role: "assistant", content: chat.answer, id: chat.question_id }, `${chat.id}-a`, false)}
                  {chat.created_at && <p className="text-[10px] text-gray-400">{formatChatTime(chat.created_at)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 px-2 text-sm text-gray-400">No questions asked yet.</p>
          )
        ) : defaultQuestions.length > 0 || conversation.length > 0 || askPending ? (
          <div className="mt-3 space-y-3 px-2 text-sm">
            {defaultQuestions.length > 0 && (
              <div>
                <p className="mb-2 text-gray-700" ref={questionsRef}>
                  Welcome!! Try asking me questions related to {sourceLabel}. You can ask questions like:
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
                        {/* Backend's own "N. " numbering is stripped — per-role hiding leaves gaps otherwise, and the bullet dot already marks each item. */}
                        {q.replace(/^\d+\.\s*/, "")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {latestExchange.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-3">
                {latestExchange.map(renderMessage)}
                {askPending && <ChatLoader />}
                <div ref={chatEndRef} />
              </div>
            )}

            {conversation.length === 0 && askPending && (
              <div className="border-t border-gray-100 pt-3">
                <ChatLoader />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 px-2 text-sm text-gray-400">Content is not available</p>
        )}
      </div>

      {docRefQuestionId && <DocReferenceModal questionId={docRefQuestionId} sourceType={patientType} onClose={() => setDocRefQuestionId(null)} />}
    </div>
  );
}
