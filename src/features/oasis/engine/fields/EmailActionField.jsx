import { useState } from "react";

// Reviewer email + "Send for Review" action (§1.11) — appears once per form, not a
// clinical data field. Presentational only here; wiring to the actual send-for-review
// API is Phase 5 (§H) — this stub takes an `onSend` callback so that wiring is additive.
export default function EmailActionField({ field, onSend }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"

  const handleSend = async () => {
    if (!onSend) return;
    setStatus("sending");
    try {
      await onSend(email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="py-3 border-t mt-4">
      <label className="block text-sm font-medium mb-1">{field.label ?? "Send for Review"}</label>
      <div className="flex items-center gap-2">
        <input
          type="email"
          placeholder="reviewer@agency.org"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={status === "sending" || !email}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send for Review ↗"}
        </button>
      </div>
      {status === "success" && <p className="text-sm text-green-600 mt-1">Sent for review.</p>}
      {status === "error" && <p className="text-sm text-red-500 mt-1">Couldn't send — try again.</p>}
    </div>
  );
}
