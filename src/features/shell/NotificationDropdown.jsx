import { useState } from "react";
import * as XLSX from "xlsx";
import { Phone, FileHeart, CalendarCheck, Settings, ChevronDown, ChevronUp, X } from "lucide-react";
import usePatientRecords from "../../hooks/usePatientRecords";
import useOpenPatientDetail from "../../hooks/useOpenPatientDetail";
import { generateCallReport } from "../../api/hospitalApi";

const SECTIONS = [
  { key: "call_alert", label: "Call Alerts", icon: Phone, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "metriport_data", label: "Discharge Alerts", icon: FileHeart, color: "text-cyan-600", bg: "bg-cyan-50" },
  { key: "appointment_booked", label: "Appointments", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "system", label: "System", icon: Settings, color: "text-gray-500", bg: "bg-gray-100" },
];

function resolveSection(type) {
  return SECTIONS.some((s) => s.key === type) ? type : "system";
}

function formatTime(ts) {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function NotificationDropdown({ notifications, onDismiss, onMarkRead, onClose }) {
  const [expanded, setExpanded] = useState({});
  const [reportState, setReportState] = useState({});
  const patients = usePatientRecords();
  const openPatientDetail = useOpenPatientDetail();

  const grouped = SECTIONS.map((sec) => ({
    ...sec,
    items: notifications.filter((n) => resolveSection(n.type) === sec.key),
  })).filter((sec) => sec.items.length > 0);

  const unreadTotal = notifications.filter((n) => n.unread).length;

  const handleItemClick = (n, clickable) => {
    if (n.unread) onMarkRead?.(n.id);
    if (!clickable) return;
    const match = patients.find((p) => p.name?.toLowerCase() === n.patient_name?.toLowerCase());
    if (!match) return;
    openPatientDetail(match);
    onClose?.();
  };

  const handleViewReport = async (n) => {
    if (!n.patient_name || !n.to_number) {
      setReportState((s) => ({ ...s, [n.id]: { error: "Missing patient or phone number." } }));
      return;
    }
    setReportState((s) => ({ ...s, [n.id]: { loading: true } }));
    try {
      const toNumber = Number(n.to_number.replace(/^\+/, ""));
      const res = await generateCallReport({ patient_name: n.patient_name, to_numbers: [toNumber] });
      const records = res?.[n.patient_name] || [];
      if (records.length === 0) {
        setReportState((s) => ({ ...s, [n.id]: { error: "No call records found." } }));
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(records);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${n.patient_name}_report.xlsx`);
      setReportState((s) => ({ ...s, [n.id]: { done: true } }));
    } catch (err) {
      setReportState((s) => ({ ...s, [n.id]: { error: err?.response?.data?.error || err?.message || "Failed to generate report." } }));
    }
  };

  return (
    <div className="absolute right-0 top-10 z-20 w-96 rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-gray-800">Notifications</span>
        <div className="flex items-center gap-2">
          {unreadTotal > 0 && <span className="text-xs font-medium text-red-600">{unreadTotal} new</span>}
          <button type="button" onClick={onClose} title="Close" aria-label="Close notifications" className="text-gray-300 hover:text-gray-500">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <FileHeart size={28} className="text-gray-200" />
            <p className="text-xs text-gray-400">You're all caught up — no notifications.</p>
          </div>
        )}

        {grouped.map((sec) => {
          const Icon = sec.icon;
          const isOpen = !!expanded[sec.key];
          const unreadCount = sec.items.filter((n) => n.unread).length;
          const clickable = sec.key !== "call_alert";
          return (
            <div key={sec.key} className="border-b border-gray-50 last:border-0">
              <button
                type="button"
                onClick={() => setExpanded((c) => ({ ...c, [sec.key]: !c[sec.key] }))}
                className={`flex w-full items-center justify-between px-4 py-2.5 ${
                  unreadCount > 0 ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${sec.bg}`}>
                    <Icon size={13} className={sec.color} />
                  </span>
                  <span className="text-xs font-medium text-gray-700">{sec.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      unreadCount > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {unreadCount > 0 ? `${unreadCount} new` : sec.items.length}
                  </span>
                </span>
                {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </button>

              {isOpen &&
                sec.items.map((n) => {
                  const rs = reportState[n.id] || {};
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n, clickable)}
                      className={`group relative flex cursor-pointer items-start gap-2 px-4 py-2.5 pl-6 text-xs ${
                        n.unread ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {n.unread && <span className="absolute left-4 top-4 h-1.5 w-1.5 rounded-full bg-red-500" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800">{n.title}</p>
                        {n.message && <p className="mt-0.5 text-gray-500">{n.message}</p>}
                        <p className="mt-1 text-[10px] text-gray-400">{formatTime(n.ts)}</p>
                        {sec.key === "call_alert" && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewReport(n);
                              }}
                              disabled={rs.loading}
                              className="rounded-md border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                            >
                              {rs.loading ? "Loading..." : "View Report"}
                            </button>
                            {rs.error && <span className="text-[10px] text-red-500">{rs.error}</span>}
                            {rs.done && <span className="text-[10px] text-emerald-600">Downloaded</span>}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(n.id);
                        }}
                        title="Dismiss"
                        className="shrink-0 text-gray-300 opacity-0 hover:text-gray-500 group-hover:opacity-100"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
