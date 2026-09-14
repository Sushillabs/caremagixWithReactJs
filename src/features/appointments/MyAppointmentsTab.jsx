import { useEffect, useState } from "react";
import { getAppointmentRequests, cancelAppointmentRequest } from "../../api/hospitalApi";
import { StatusPill, APPOINTMENT_TYPE_LABEL, formatDateTime } from "./appointmentFormat";

// No shared "dashboard" call backs this tab (unlike Wellness's Trends/Baseline,
// both fed by one GET /dashboard) — /physician-appointment/requests is its
// own standalone endpoint, so this tab fetches independently on mount.
export default function MyAppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  const loadAppointments = () => {
    setLoading(true);
    getAppointmentRequests()
      .then((data) => {
        setAppointments(data?.appointments || []);
        setError(null);
      })
      .catch((err) => setError(err?.message || "Could not load your appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    if (cancelingId) return;
    setCancelingId(id);
    try {
      await cancelAppointmentRequest(id);
      loadAppointments();
    } catch (err) {
      setError(err?.message || "Could not cancel this appointment");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <p className="p-4 text-sm text-gray-400">Loading your appointments...</p>;
  if (error) return <p className="p-4 text-sm text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-1.5 p-3">
      {appointments.length === 0 && <p className="text-xs text-gray-400">No appointments booked yet.</p>}
      {appointments.map((appt) => {
        const cancellable = appt.status === "confirmed" || appt.status === "pending";
        return (
          <div key={appt.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 p-2 text-xs">
            <div className="min-w-0">
              <div className="font-medium text-gray-700">{appt.physician_name || "Physician"}</div>
              <div className="text-gray-500">{formatDateTime(appt.appointment_datetime)}</div>
              <div className="text-gray-400">
                {[APPOINTMENT_TYPE_LABEL[appt.appointment_type] || appt.appointment_type, appt.reason].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusPill status={appt.status} />
              {cancellable && (
                <button
                  type="button"
                  onClick={() => handleCancel(appt.id)}
                  disabled={cancelingId === appt.id}
                  className="text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cancelingId === appt.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
