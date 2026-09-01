import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { ChevronUp, ChevronDown, Tag, MapPin, Users } from "lucide-react";
import { getPatientEncounterTimeline } from "../../api/hospitalApi";

const TYPE_STYLE = {
  ambulatory: "bg-emerald-100 text-emerald-700",
  outpatient: "bg-emerald-100 text-emerald-700",
  emergency: "bg-red-100 text-red-700",
  inpatient: "bg-amber-100 text-amber-700",
  virtual: "bg-blue-100 text-blue-700",
  telehealth: "bg-blue-100 text-blue-700",
};
const typeStyle = (type) => TYPE_STYLE[(type || "").toLowerCase()] || "bg-gray-100 text-gray-600";

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateWithYear(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(start, end) {
  const s = start ? new Date(start) : null;
  if (!s || Number.isNaN(s.getTime())) return "—";
  if (!end) return s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return "—";
  const mins = Math.round((e - s) / 60000);
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : `${m}m`;
}

function MetaField({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} className="text-gray-400" />
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
      <span className={value ? "text-[11px] font-medium text-gray-700" : "text-[11px] italic text-gray-300"}>{value || "Not provided"}</span>
    </div>
  );
}

export default function PatientTimelinePanel() {
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const patientName = singleData?.patient_name;
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartOpen, setChartOpen] = useState(true);

  const { setAssistantHidden } = useOutletContext() || {};
  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["patient-encounter-timeline", patientName],
    queryFn: () => getPatientEncounterTimeline({ patient_name: patientName }),
    enabled: Boolean(patientName),
  });

  const summary = data?.summary;

  const years = useMemo(() => {
    const timeline = data?.timeline || [];
    const byYear = {};
    timeline.forEach((e) => {
      const y = (e.start || "").slice(0, 4);
      if (!y) return;
      (byYear[y] = byYear[y] || []).push(e);
    });
    return Object.keys(byYear)
      .sort()
      .map((year) => ({
        year,
        count: byYear[year].length,
        hasEr: byYear[year].some((e) => (e.type || "").toLowerCase() === "emergency"),
        items: byYear[year].slice().sort((a, b) => (a.start || "").localeCompare(b.start || "")),
      }));
  }, [data]);

  const maxCount = Math.max(1, ...years.map((y) => y.count));
  const activeYear = selectedYear || years[years.length - 1]?.year;
  const activeYearData = years.find((y) => y.year === activeYear);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Patient Timeline</h2>
          {summary && (
            <p className="mt-0.5 text-xs text-gray-400">
              {summary.total} {summary.total === 1 ? "encounter" : "encounters"}
              {summary.date_range?.start && summary.date_range?.end
                ? ` · ${formatDateWithYear(summary.date_range.start)} – ${formatDateWithYear(summary.date_range.end)}`
                : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Encounter volume
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Year had an ER visit
          </span>
          <button
            type="button"
            onClick={() => setChartOpen((o) => !o)}
            title={chartOpen ? "Collapse chart" : "Expand chart"}
            className="ml-1 flex items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            {chartOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isLoading && <p className="p-4 text-sm text-gray-400">Loading timeline...</p>}
      {isError && <p className="p-4 text-sm text-red-600">{error?.response?.data?.message || "Failed to load timeline."}</p>}
      {!isLoading && !isError && years.length === 0 && <p className="p-4 text-sm text-gray-400">No encounters found for this patient.</p>}

      {!isLoading && !isError && years.length > 0 && (
        <>
          {chartOpen && (
            <div className="px-6 pt-5">
              <div className="overflow-x-auto pb-1.5">
                <div className="flex w-max items-end gap-2">
                  {years.map((y) => {
                    const selected = y.year === activeYear;
                    const barHeight = 10 + Math.round((y.count / maxCount) * 118);
                    return (
                      <button
                        type="button"
                        key={y.year}
                        onClick={() => setSelectedYear(y.year)}
                        title={`${y.year} — ${y.count} ${y.count === 1 ? "encounter" : "encounters"}`}
                        className="flex w-12 shrink-0 flex-col items-center"
                      >
                        <div className="flex h-[90px] w-full flex-col items-center justify-end">
                          {y.hasEr && <span className="mb-1 h-1.5 w-1.5 rounded-full bg-red-600" />}
                          <div
                            className="w-full max-w-[25px] rounded-t"
                            style={{ height: barHeight, background: selected ? "#065f46" : "#a7f3d0" }}
                          />
                        </div>
                        <div className="h-0.5 w-full bg-gray-200" />
                        <div className={`mt-1 text-[10px] ${selected ? "font-bold text-emerald-800" : "font-medium text-gray-400"}`}>
                          '{y.year.slice(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-0.5 text-right text-[10px] text-gray-300">← scroll for earlier years →</p>
            </div>
          )}

          <div className="mt-1 min-h-0 flex-1 overflow-y-auto border-t border-gray-100 px-6 py-3.5">
            <div className="mb-2 text-sm font-semibold text-gray-800">
              {activeYear} · {activeYearData?.items.length} {activeYearData?.items.length === 1 ? "encounter" : "encounters"}
            </div>
            <div className="flex flex-col gap-1">
              {activeYearData?.items.map((row) => (
                <div key={row.id} className="rounded-lg border border-gray-100 p-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${typeStyle(row.type)}`}>{row.type || "Unknown"}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-400">
                        {row.status || "unknown"}
                      </span>
                      {row.is_mine && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">Seen by you</span>}
                    </div>
                    <div className="flex items-center gap-2.5 whitespace-nowrap text-xs text-gray-500">
                      <span>{formatShortDate(row.start)}</span>
                      <span className="text-gray-300">{formatDuration(row.start, row.end)}</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-800">{(row.reasons || []).join(", ") || "No reason recorded"}</p>
                  <div className="mt-1 flex flex-wrap gap-4 border-t border-dashed border-gray-100 pt-1">
                    <MetaField icon={Tag} label="Class" value={row.class} />
                    <MetaField icon={MapPin} label="Location" value={row.location} />
                    <MetaField icon={Users} label="Participants" value={(row.participants || []).filter(Boolean).join(", ")} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
