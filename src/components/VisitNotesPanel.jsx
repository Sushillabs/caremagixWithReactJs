import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AskQuestion from "./AskQuestion";
import VisitNotesHeader from "./VisitNotesHeader";
import AssistantAvatar from "./AssistantAvatar";
import { Spinner } from "./Spiner";

const GENERATE_NOW_QUESTION = "All sections complete! Shall I generate the final visit note now? (yes/no)";

const VisitNotesPanel = () => {
  const { firstQ, pendingChat, notes_chat, template } = useSelector((state) => state.notes);
  const file_path = template?.data?.pdf_path;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pendingChat, notes_chat, template.error]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {template.loading && !template.data && <Spinner />}

      {template.data && <VisitNotesHeader />}

      {template.data && (
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          <div className="flex items-start gap-2 sm:mb-2 mb-1">
            <AssistantAvatar />
            <span className="text-gray-700 text-xs sm:text-sm">{firstQ}</span>
          </div>

          {notes_chat &&
            notes_chat.map((chat) => {
              return (
                <div key={chat.id} className="mb-4">
                  {/* Answer */}
                  <div className="flex items-start justify-end gap-2 text-right mb-2">
                    <span className="text-xs sm:text-sm text-gray-700">{chat.answer}</span>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                      A
                    </div>
                  </div>
                  {/* Question */}
                  {chat.final_template && (
                    <div className="flex items-start gap-2 sm:mb-2 mb-1">
                      <AssistantAvatar />
                      <span className="text-gray-700 text-xs sm:text-sm">Visit note is ready.</span>
                    </div>
                  )}
                  {chat.question === GENERATE_NOW_QUESTION ? (
                    <div className="flex items-start gap-2 sm:mb-2 mb-1">
                      <AssistantAvatar />
                      <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-800">
                        {chat.question}
                        <div className="mt-1 text-xs font-normal text-emerald-700">
                          You can use Review &amp; Edit above to make changes before confirming.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 sm:mb-2 mb-1">
                      <AssistantAvatar />
                      <span className="text-gray-700 text-xs sm:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.question}</ReactMarkdown>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

          {pendingChat && (
            <div className="flex items-start justify-end gap-2 text-right mb-2">
              <span className="text-xs sm:text-sm text-gray-700">{pendingChat.answer}</span>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">A</div>
            </div>
          )}
          {template.error && (
            <div className="text-xs sm:text-sm overflow-x-auto text-red-400 border border-red-400 rounded p-2 bg-red-100 mb-2">
              {template.error || "Somthing went wrong, Please try again"}
            </div>
          )}
          {template.loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-3 py-2 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
      {template.data && !file_path && <AskQuestion isVisitNotes />}
    </div>
  );
};

export default VisitNotesPanel;
