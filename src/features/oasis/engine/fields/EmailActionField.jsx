import { useState } from "react";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_STYLES = {
  sending: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function EmailActionField({ field, onSend }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) return setStatus({ kind: "error", text: "Please enter a reviewer email address." });
    if (!EMAIL_RX.test(trimmed)) {
      return setStatus({ kind: "error", text: "Please enter a valid email address (e.g. name@agency.org)." });
    }
    if (!onSend) return;

    setStatus({ kind: "sending", text: `Sending assessment to ${trimmed}…` });
    try {
      await onSend(trimmed);
      setStatus({
        kind: "success",
        text: `Assessment sent successfully to ${trimmed}. The reviewer will receive an email to review it.`,
      });
    } catch (err) {
      setStatus({ kind: "error", text: err?.response?.data?.error || err?.message || "Could not send. Please try again." });
    }
  };

  const sending = status?.kind === "sending";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-gray-800">{field.label ?? "Send for Review"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          placeholder="reviewer@agency.org"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
          className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="h-10 shrink-0 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send for Review"}
        </button>
      </div>
      {status && (
        <p className={`mt-2 rounded-md border px-2.5 py-2 text-xs ${STATUS_STYLES[status.kind]}`}>{status.text}</p>
      )}
    </div>
  );
}
