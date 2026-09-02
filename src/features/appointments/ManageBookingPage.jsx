import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPhysicianCalendarAppointments,
  updatePhysicianCalendarAppointment,
  cancelPhysicianCalendarAppointment,
  getPhysicianCalendarSettings,
  updatePhysicianCalendarSettings,
  getPhysicianCalendarAvailability,
  getPhysicianCalendarBlocks,
  createPhysicianCalendarBlock,
  deletePhysicianCalendarBlock,
} from "../../api/hospitalApi";
import { StatusPill, APPOINTMENT_TYPE_LABEL, formatDateTime } from "./appointmentFormat";

const APPOINTMENTS_QUERY_KEY = ["physician-calendar-appointments"];
const SETTINGS_QUERY_KEY = ["physician-calendar-settings"];
const AVAILABILITY_QUERY_KEY = ["physician-calendar-availability"];
const BLOCKS_QUERY_KEY = ["physician-calendar-blocks"];

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "settings", label: "Calendar" },
  { key: "blocks", label: "Blocked Time" },
];

const BLOCK_TYPE_LABEL = { blocked: "Blocked", time_off: "Time off" };

const EMPTY_BLOCK_FORM = { start: "", end: "", reason: "", block_type: "blocked" };

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in local time.
function toDatetimeLocalValue(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AppointmentsTab() {
  const queryClient = useQueryClient();
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [actionError, setActionError] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: () => getPhysicianCalendarAppointments(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePhysicianCalendarAppointment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
    onError: (err) => setActionError(err?.response?.data?.message || err?.message || "Could not update this appointment."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelPhysicianCalendarAppointment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
    onError: (err) => setActionError(err?.response?.data?.message || err?.message || "Could not cancel this appointment."),
  });

  const appointments = data?.appointments || [];

  const startReschedule = (appt) => {
    setActionError(null);
    setReschedulingId(appt.id);
    setRescheduleValue(toDatetimeLocalValue(appt.appointment_datetime));
  };

  const saveReschedule = (id) => {
    if (!rescheduleValue) return;
    setActionError(null);
    updateMutation.mutate(
      { id, payload: { appointment_datetime: new Date(rescheduleValue).toISOString() } },
      { onSuccess: () => setReschedulingId(null) }
    );
  };

  const handleConfirm = (id) => {
    setActionError(null);
    updateMutation.mutate({ id, payload: { status: "confirmed" } });
  };

  const handleCancel = (id) => {
    setActionError(null);
    cancelMutation.mutate(id);
  };

  return (
    <>
      {actionError && <p className="border-b border-gray-100 px-4 py-2 text-xs text-red-600">{actionError}</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Date &amp; Time</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          )}
          {isError && !isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                {error?.response?.data?.error || error?.message || "Failed to load appointments."}
              </td>
            </tr>
          )}
          {!isLoading && !isError && appointments.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No appointments booked with you yet.
              </td>
            </tr>
          )}
          {appointments.map((appt) => {
            const isRescheduling = reschedulingId === appt.id;
            const isUpdating = updateMutation.isPending && updateMutation.variables?.id === appt.id;
            const isCancelling = cancelMutation.isPending && cancelMutation.variables === appt.id;
            const active = appt.status === "pending" || appt.status === "confirmed";

            return (
              <tr key={appt.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{appt.patient_display_name || "Patient"}</td>
                <td className="px-4 py-3 text-gray-700">
                  {isRescheduling ? (
                    <input
                      type="datetime-local"
                      value={rescheduleValue}
                      onChange={(e) => setRescheduleValue(e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  ) : (
                    formatDateTime(appt.appointment_datetime)
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{APPOINTMENT_TYPE_LABEL[appt.appointment_type] || appt.appointment_type}</td>
                <td className="px-4 py-3 text-gray-500">{appt.reason || "—"}</td>
                <td className="px-4 py-3">
                  <StatusPill status={appt.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    {isRescheduling ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveReschedule(appt.id)}
                          disabled={isUpdating}
                          className="font-medium text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={() => setReschedulingId(null)} className="text-gray-500 hover:underline">
                          Cancel
                        </button>
                      </>
                    ) : (
                      active && (
                        <>
                          {appt.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleConfirm(appt.id)}
                              disabled={isUpdating}
                              className="font-medium text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating ? "Confirming..." : "Confirm"}
                            </button>
                          )}
                          <button type="button" onClick={() => startReschedule(appt)} className="font-medium text-gray-600 hover:underline">
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(appt.id)}
                            disabled={isCancelling}
                            className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCancelling ? "Cancelling..." : "Cancel"}
                          </button>
                        </>
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function SettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => getPhysicianCalendarSettings(),
  });

  const availabilityQuery = useQuery({
    queryKey: AVAILABILITY_QUERY_KEY,
    queryFn: () => getPhysicianCalendarAvailability(10),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => updatePhysicianCalendarSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updated);
      queryClient.invalidateQueries({ queryKey: AVAILABILITY_QUERY_KEY });
      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => setSaveError(err?.response?.data?.message || err?.message || "Could not save settings."),
  });

  const handleDayChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      work_hours: { ...prev.work_hours, [day]: { ...prev.work_hours[day], [field]: value } },
    }));
  };

  const handleSave = () => {
    saveMutation.mutate({
      timezone: form.timezone,
      slot_duration_minutes: Number(form.slot_duration_minutes),
      days_ahead: Number(form.days_ahead),
      work_hours: form.work_hours,
    });
  };

  if (isLoading || !form) return <p className="p-4 text-sm text-gray-400">Loading settings...</p>;
  if (isError) return <p className="p-4 text-sm text-red-600">{error?.message || "Failed to load settings."}</p>;

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Booking settings</h3>

        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-700">Timezone (IANA)</label>
            <input
              type="text"
              value={form.timezone || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
              placeholder="UTC"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Slot length (minutes)</label>
              <input
                type="number"
                min={15}
                max={120}
                step={15}
                value={form.slot_duration_minutes ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, slot_duration_minutes: e.target.value }))}
                className="mt-0 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Book how many days ahead</label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.days_ahead ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, days_ahead: e.target.value }))}
                className="mt-0 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Work hours</label>
            <div className="mt-0 space-y-1">
              {DAYS.map((day) => {
                const dayValue = form.work_hours?.[day.key] || { enabled: false, start: "09:00", end: "17:00" };
                return (
                  <div key={day.key} className="flex items-center gap-2 text-xs text-gray-700">
                    <label className="flex w-24 shrink-0 items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={dayValue.enabled}
                        onChange={(e) => handleDayChange(day.key, "enabled", e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
                      />
                      {day.label}
                    </label>
                    <input
                      type="time"
                      value={dayValue.start}
                      disabled={!dayValue.enabled}
                      onChange={(e) => handleDayChange(day.key, "start", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={dayValue.end}
                      disabled={!dayValue.enabled}
                      onChange={(e) => handleDayChange(day.key, "end", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {saveError && <p className="text-xs text-red-600">{saveError}</p>}
          {saved && <p className="text-xs text-emerald-700">Settings saved.</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{`Next ${
          availabilityQuery.data?.slots?.length || 0
        } open slots`}</h3>
        {availabilityQuery.isLoading && <p className="text-xs text-gray-400">Loading availability...</p>}
        {availabilityQuery.isError && <p className="text-xs text-red-600">Failed to load availability.</p>}
        {!availabilityQuery.isLoading && !availabilityQuery.isError && (availabilityQuery.data?.slots?.length || 0) === 0 && (
          <p className="text-xs text-gray-400">No open slots based on current settings.</p>
        )}
        <div className="space-y-1.5">
          {availabilityQuery.data?.slots?.map((slot) => (
            <div key={slot.datetime} className="rounded-md border border-gray-100 px-3 py-1.5 text-xs text-gray-700">
              {slot.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockedTimeTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_BLOCK_FORM);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: BLOCKS_QUERY_KEY,
    queryFn: () => getPhysicianCalendarBlocks(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createPhysicianCalendarBlock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AVAILABILITY_QUERY_KEY });
      setForm(EMPTY_BLOCK_FORM);
      setFormError(null);
    },
    onError: (err) => setFormError(err?.response?.data?.message || err?.message || "Could not add this block."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePhysicianCalendarBlock(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AVAILABILITY_QUERY_KEY });
    },
    onSettled: () => setDeletingId(null),
  });

  const handleAdd = () => {
    if (!form.start || !form.end) {
      setFormError("Start and end are both required.");
      return;
    }
    createMutation.mutate({
      start_datetime: new Date(form.start).toISOString(),
      end_datetime: new Date(form.end).toISOString(),
      reason: form.reason || undefined,
      block_type: form.block_type,
    });
  };

  const blocks = data?.blocks || [];

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Add blocked time</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Start</label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm((prev) => ({ ...prev, start: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">End</label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={(e) => setForm((prev) => ({ ...prev, end: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Type</label>
            <select
              value={form.block_type}
              onChange={(e) => setForm((prev) => ({ ...prev, block_type: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="blocked">Blocked</option>
              <option value="time_off">Time off</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Reason (optional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Vacation, conference"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <button
            type="button"
            onClick={handleAdd}
            disabled={createMutation.isPending}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? "Adding..." : "Add Block"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming blocks</h3>
        {isLoading && <p className="text-xs text-gray-400">Loading blocks...</p>}
        {isError && <p className="text-xs text-red-600">{error?.message || "Failed to load blocks."}</p>}
        {!isLoading && !isError && blocks.length === 0 && <p className="text-xs text-gray-400">No blocked time yet.</p>}
        <div className="space-y-1.5">
          {blocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 p-2 text-xs">
              <div className="min-w-0">
                <div className="font-medium text-gray-700">
                  {formatDateTime(block.start_datetime)} — {formatDateTime(block.end_datetime)}
                </div>
                <div className="text-gray-400">
                  {[BLOCK_TYPE_LABEL[block.block_type] || block.block_type, block.reason].filter(Boolean).join(" · ")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(block.id)}
                disabled={deletingId === block.id}
                className="shrink-0 font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingId === block.id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManageBookingPage() {
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-800">Manage Calendar</h2>
        <div className="flex items-center gap-4 text-xs">
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
        </div>
      </div>

      {activeTab === "appointments" && <AppointmentsTab />}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "blocks" && <BlockedTimeTab />}
    </div>
  );
}
