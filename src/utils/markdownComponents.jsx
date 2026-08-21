// Shared react-markdown table renderer — pulled out of ConversationCard.jsx
// so any chat surface (AgentChatThread included) renders markdown tables
// the same way instead of redefining this per feature.
export const markdownTableComponents = {
  table: ({ children }) => <table className="min-w-full border-collapse text-xs">{children}</table>,
  thead: ({ children }) => <thead className="bg-emerald-50 text-left text-gray-700">{children}</thead>,
  th: ({ children }) => <th className="border border-gray-200 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="whitespace-pre-line border border-gray-200 px-3 py-2 align-top text-gray-600">{children}</td>,
};
