import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download } from "lucide-react";
import { Spinner } from "../../components/Spiner";
import ChatLoader from "../../components/ChatLoader";
import useAskQuestion from "../../hooks/useAskQuestion";

const markdownTableComponents = {
  table: ({ children }) => <table className="min-w-full border-collapse text-xs">{children}</table>,
  thead: ({ children }) => <thead className="bg-emerald-50 text-left text-gray-700">{children}</thead>,
  th: ({ children }) => <th className="border border-gray-200 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="whitespace-pre-line border border-gray-200 px-3 py-2 align-top text-gray-600">{children}</td>,
};

const TABS = [
  { key: "conversation", label: "Conversation" },
  { key: "summary", label: "Summary" },
  { key: "history", label: "Chat History" },
];

export default function ConversationCard() {
  const [activeTab, setActiveTab] = useState("conversation");
  const { data: chatData, loading: chatLoading, error: chatError, isAskPending: askPending } = useSelector((state) => state.askQ) || {};
  const conversation = useSelector((state) => state.askQ?.value) || [];
  const { askQuestion } = useAskQuestion();
  const questionsRef = useRef(null);
  const scrollToQuestions = () => questionsRef.current?.scrollIntoView({ behavior: "smooth" });
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, askPending]);
  const summaryTable = chatData?.[0];
  // index 0 is the summary table, the last item is the MMTA question (not shown here), everything between is the default question list
  const defaultQuestions = chatData?.length > 2 ? chatData.slice(1, -1) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="shrink-0 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-2 bg-[#F0FDF4]">
        <div>
          <h3 className="text-xs font-bold text-gray-800">Discharged Plan</h3>
          <p className="text-xs text-gray-400">Generated on — xx-xx-xxxx</p>
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
                {askPending && <ChatLoader />}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 px-2 text-sm text-gray-400">Document content will render here in a later.</p>
        )}
      </div>
    </div>
  );
}
