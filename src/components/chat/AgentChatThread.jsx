import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatLoader from "../ChatLoader";
import AssistantAvatar from "../AssistantAvatar";
import { markdownTableComponents } from "../../utils/markdownComponents";

// Generic chat-agent thread, same "section card" shell every chat surface in
// this app uses (see ConversationCard.jsx): rounded card, header bar,
// scrollable bubble list. Feature pages (Wellness Check-in, Book
// Appointment, ...) pass their own header content and turns from
// useAgentChat — this component only knows how to render a conversation, not
// which backend it came from.
export default function AgentChatThread({
  header,
  turns = [],
  pending,
  error,
  quickReplies,
  onQuickReply,
  emptyState,
  renderExtra,
  bare = false,
  // Live, word-by-word interim transcript (voice.transcript) — shown as one
  // extra "in progress" user bubble below the real turns while speaking, same
  // idea as legacy's upsertLiveTranscript. Optional — omit to leave a chat
  // surface unchanged.
  liveText,
}) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pending, liveText]);

  const hasContent = turns.length > 0 || pending || !!liveText;
  const lastAssistantIndex = turns.map((t) => t.role).lastIndexOf("assistant");

  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto pb-4">
      {error && <p className="mt-3 px-2 text-sm text-red-600">Error: {error}</p>}

      {!hasContent && !error && <p className="mt-3 px-2 text-sm text-gray-400">{emptyState || "Start the conversation below."}</p>}

      {hasContent && (
        <div className="mt-3 space-y-3 px-2 text-sm">
          {turns.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex items-start justify-end gap-2 text-right">
                <span className="text-gray-700">{msg.content}</span>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  A
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2 text-gray-700">
                <AssistantAvatar />
                <div className="min-w-0 flex-1 space-y-2">
                  {typeof msg.content === "string" && (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownTableComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                  {renderExtra?.(msg.meta, { isLast: i === lastAssistantIndex })}
                </div>
              </div>
            )
          )}
          {liveText && (
            <div className="flex items-start justify-end gap-2 text-right opacity-70">
              <span className="italic text-gray-500">{liveText}</span>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                A
              </div>
            </div>
          )}
          {pending && <ChatLoader />}
          <div ref={chatEndRef} />
        </div>
      )}

      {!pending && quickReplies?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 px-2">
          {quickReplies.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onQuickReply?.(option)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // bare: parent already draws the section-card wrapper + its own header
  // (e.g. WellnessCheckInPanel, matching ConversationCard's header bar
  // exactly) — this component only contributes the scrollable message area.
  if (bare) return body;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
      {header && <div className="shrink-0 border-b border-gray-100 bg-[#F0FDF4] p-2 text-xs">{header}</div>}
      {body}
    </div>
  );
}
