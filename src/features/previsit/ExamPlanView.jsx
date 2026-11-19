import { useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";

// Same markers BE uses to drop "no data" lines.
const MISSING_MARKERS = [
  "insufficient data",
  "not on file",
  "not recorded",
  "not documented",
  "not available",
  "cannot be interpreted",
  "no number recorded",
];

const isMissing = (text) => {
  const value = String(text || "").trim().toLowerCase();
  return !value || MISSING_MARKERS.some((marker) => value.includes(marker));
};

const keep = (list) => list.map((text) => String(text || "").trim()).filter((text) => !isMissing(text));

const toPoints = (text) =>
  keep(
    String(text || "")
      .split(/\.\s+/)
      .map((part) => part.replace(/\.$/, ""))
  );

const GROUP_GRID = "space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-2 md:space-y-0";

function GroupHeading({ children }) {
  return <p className="border-b border-gray-200 pb-0.5 pt-1 text-sm font-semibold text-gray-800">{children}</p>;
}

function Card({ title, children, wide = false }) {
  return (
    <div className={`rounded-lg border border-gray-200 px-2.5 py-2 ${wide ? "md:col-span-2" : ""}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul className="list-disc space-y-0.5 pl-4 text-sm text-gray-700">
      {items.map((text, i) => (
        <li key={i}>{text}</li>
      ))}
    </ul>
  );
}

function SuggestionTag({ text }) {
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{text || "Suggestion - physician decides"}</span>;
}

function PatientNote({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Card title="Note for patient" wide>
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm text-gray-700">{text}</p>
        <button
          type="button"
          onClick={copy}
          className="flex min-h-8 shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2 text-xs text-gray-700 hover:bg-gray-50"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Card>
  );
}

export default function ExamPlanView({ plan }) {
  const header = plan?.header || {};
  const exam = plan?.exam || {};
  const ap = plan?.assessment_and_plan || {};

  const inOffice = keep(exam.in_office_preliminary_read?.findings || []);
  const conclusion = isMissing(exam.in_office_preliminary_read?.conclusion) ? "" : exam.in_office_preliminary_read.conclusion;
  const liveExam = toPoints(exam.live_exam);
  const labs = (exam.labs_ordered_today || []).filter((lab) => !isMissing(lab.test));
  const planItems = (ap.plan || []).filter((item) => !isMissing(item.action));
  const safety = (ap.interaction_and_safety || []).filter((item) => !isMissing(item.text));
  const prevention = (plan?.prevention_checklist || []).filter((item) => !isMissing(item.action || item.item));
  const actions = (plan?.physician_actions || []).filter((item) => !isMissing(item.action));
  const assessmentPoints = keep(String(ap.assessment || "").split(";"));
  const patientNote = isMissing(plan?.patient_note) ? "" : plan.patient_note;

  return (
    <div className="space-y-2">
      {header.urgent && (
        <div className="flex items-start gap-2 rounded-lg bg-red-600 px-3 py-2 text-white">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">{header.urgent.banner}</p>
            <p>{header.urgent.reason}</p>
            {header.urgent.source && <p className="text-xs text-red-100">Source: {header.urgent.source}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 sm:flex-row sm:gap-2">
        <p className="min-w-0 flex-1 text-sm text-gray-700">{header.one_line}</p>
        {header.status && (
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            {header.status}
          </span>
        )}
      </div>

      {(inOffice.length > 0 || conclusion || liveExam.length > 0 || labs.length > 0) && <GroupHeading>Exam &amp; Preliminary Reads</GroupHeading>}
      <div className={GROUP_GRID}>
        {(inOffice.length > 0 || conclusion) && (
          <Card title="In office (urgent check recommendation)">
            {inOffice.length > 0 && <Bullets items={inOffice} />}
            {conclusion && (
              <>
                <p className="mt-1.5 text-xs font-semibold text-gray-500">Conclusion</p>
                <p className="text-sm font-medium text-gray-800">{conclusion}</p>
              </>
            )}
          </Card>
        )}

        {liveExam.length > 0 && (
          <Card title="Vitals and exam (entered live)">
            <Bullets items={liveExam} />
          </Card>
        )}

        {labs.length > 0 && (
          <Card title="Labs today" wide>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-1 pr-3 font-medium">Test</th>
                    <th className="py-1 pr-3 font-medium">Reason</th>
                    <th className="py-1 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab, i) => (
                    <tr key={lab.id || i} className="border-t border-gray-100 align-top">
                      <td className="py-1 pr-3 font-medium text-gray-800">
                        {lab.test}
                        {lab.physician_discretion && <p className="text-xs font-normal text-gray-500">Physician discretion</p>}
                      </td>
                      <td className="py-1 pr-3 text-gray-700">{lab.reason}</td>
                      <td className="py-1 text-xs text-gray-500">{isMissing(lab.source) ? "" : lab.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <GroupHeading>Proposed assessment and plan</GroupHeading>
      <div className={GROUP_GRID}>
        {assessmentPoints.length > 0 && (
          <Card title="Assessment" wide>
            <Bullets items={assessmentPoints} />
          </Card>
        )}

        <Card title="Plan" wide>
          {planItems.length === 0 ? (
            <p className="text-xs text-gray-400">No plan items</p>
          ) : (
            <ol className="space-y-2">
              {planItems.map((item, i) => (
                <li key={item.id || i} className="rounded-md border border-gray-100 bg-white px-2 py-1.5">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="min-w-0 flex-1 text-sm font-medium text-gray-800">
                      {i + 1}. {item.action}
                    </p>
                    <SuggestionTag text={item.tag} />
                  </div>
                  {!isMissing(item.why) && <p className="text-sm text-gray-600">{item.why}</p>}
                  {!isMissing(item.source?.patient_record) && (
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Record: </span>
                      {item.source.patient_record}
                    </p>
                  )}
                  {!isMissing(item.source?.harrison) && (
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Reference: </span>
                      {item.source.harrison}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card>

        {safety.length > 0 && (
          <Card title="Interaction and safety" wide>
            <ul className="space-y-1.5">
              {safety.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    {item.mark || "check"}
                  </span>
                  <span>
                    {item.text}
                    {!isMissing(item.source) && (
                      <span className="block text-xs text-gray-400">
                        <span className="font-medium text-gray-500">Source: </span>
                        {item.source}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {(prevention.length > 0 || actions.length > 0 || patientNote) && <GroupHeading>Prevention checklist and sign-off</GroupHeading>}
      <div className={GROUP_GRID}>
        {prevention.length > 0 && (
          <Card title="Prevention">
            <ul className="space-y-1 text-sm text-gray-700">
              {prevention.map((item, i) => (
                <li key={item.id || i}>
                  <span className="font-medium text-gray-800">{item.action || item.item}</span>
                  <span className="block text-xs text-gray-500">{isMissing(item.reason) ? "No status in the chart" : item.reason}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {actions.length > 0 && (
          <Card title="Physician actions" wide>
            <ul className="space-y-1 text-sm text-gray-700 md:hidden">
              {actions.map((item, i) => (
                <li key={i}>
                  <span className="font-medium text-gray-800">{item.item}: </span>
                  {item.action}
                </li>
              ))}
            </ul>
            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="w-1/3 py-1 pr-3 font-medium">Item</th>
                  <th className="py-1 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100 align-top">
                    <td className="py-1 pr-3 font-medium text-gray-800">{item.item}</td>
                    <td className="py-1 text-gray-700">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {patientNote && <PatientNote text={patientNote} />}
      </div>
    </div>
  );
}
