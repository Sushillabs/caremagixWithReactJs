import { Plus, X } from "lucide-react";

const INPUT = "w-full rounded-md border border-gray-300 px-2 py-1.5 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 md:text-sm";
const SUGGESTION_TAG = "Suggestion - physician decides";

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 px-2.5 py-2">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 2 }) {
  return (
    <Field label={label}>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} className={INPUT} />
    </Field>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </Field>
  );
}

function Row({ meta, onRemove, children }) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-1.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs text-gray-400">{meta}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
      <Plus size={14} />
      {label}
    </button>
  );
}

const changeAt = (list, index, value) => list.map((item, i) => (i === index ? value : item));
const removeAt = (list, index) => list.filter((_, i) => i !== index);

function newId(prefix, list) {
  let n = 1;
  while (list.some((item) => item.id === `${prefix}-new-${n}`)) n += 1;
  return `${prefix}-new-${n}`;
}

export default function ExamPlanEditor({ draft, setDraft }) {
  const exam = draft.exam || {};
  const read = exam.in_office_preliminary_read || {};
  const findings = read.findings || [];
  const labs = exam.labs_ordered_today || [];
  const ap = draft.assessment_and_plan || {};
  const planItems = ap.plan || [];
  const safety = ap.interaction_and_safety || [];
  const prevention = draft.prevention_checklist || [];
  const actions = draft.physician_actions || [];

  const setExam = (key, value) => setDraft((d) => ({ ...d, exam: { ...d.exam, [key]: value } }));
  const setRead = (key, value) => setExam("in_office_preliminary_read", { ...read, [key]: value });
  const setAp = (key, value) => setDraft((d) => ({ ...d, assessment_and_plan: { ...d.assessment_and_plan, [key]: value } }));
  const setTop = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const setLab = (i, changes) => setExam("labs_ordered_today", changeAt(labs, i, { ...labs[i], ...changes }));
  const setPlanItem = (i, changes) => setAp("plan", changeAt(planItems, i, { ...planItems[i], ...changes }));
  const setPlanSource = (i, key, value) => setPlanItem(i, { source: { ...planItems[i].source, [key]: value } });
  const setSafety = (i, changes) => setAp("interaction_and_safety", changeAt(safety, i, { ...safety[i], ...changes }));
  const setPrevention = (i, changes) => setTop("prevention_checklist", changeAt(prevention, i, { ...prevention[i], ...changes }));
  const setAction = (i, changes) => setTop("physician_actions", changeAt(actions, i, { ...actions[i], ...changes }));

  return (
    <div className="space-y-2">
      <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
        Editing the exam plan. Changes are saved only when you click Save.
      </p>

      <Card title="In office (urgent check recommendation)">
        {findings.map((text, i) => (
          <Row key={i} meta={`Finding ${i + 1}`} onRemove={() => setRead("findings", removeAt(findings, i))}>
            <TextArea label="Finding" value={text} onChange={(v) => setRead("findings", changeAt(findings, i, v))} />
          </Row>
        ))}
        <AddButton label="Add finding" onClick={() => setRead("findings", [...findings, ""])} />
        <TextArea label="Conclusion" value={read.conclusion} onChange={(v) => setRead("conclusion", v)} />
      </Card>

      <Card title="Vitals and exam (entered live)">
        <TextArea label="Vitals and exam" value={exam.live_exam} onChange={(v) => setExam("live_exam", v)} rows={3} />
      </Card>

      <Card title="Labs today">
        {labs.map((lab, i) => (
          <Row key={i} meta={lab.id ? `#${lab.id}` : `Lab ${i + 1}`} onRemove={() => setExam("labs_ordered_today", removeAt(labs, i))}>
            <TextInput label="Test" value={lab.test} onChange={(v) => setLab(i, { test: v })} />
            <TextArea label="Reason" value={lab.reason} onChange={(v) => setLab(i, { reason: v })} />
            <TextArea label="Source" value={lab.source} onChange={(v) => setLab(i, { source: v, pathway_citation: v })} />
            <label className="flex min-h-8 items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={!!lab.physician_discretion}
                onChange={(e) => setLab(i, { physician_discretion: e.target.checked })}
                className="h-4 w-4 accent-emerald-700"
              />
              Physician discretion
            </label>
          </Row>
        ))}
        <AddButton
          label="Add lab"
          onClick={() =>
            setExam("labs_ordered_today", [
              ...labs,
              { id: newId("lab", labs), test: "", reason: "", physician_discretion: false, source: "", pathway_citation: "" },
            ])
          }
        />
      </Card>

      <Card title="Assessment">
        <TextArea label="Assessment (separate points with ;)" value={ap.assessment} onChange={(v) => setAp("assessment", v)} rows={4} />
      </Card>

      <Card title="Plan">
        {planItems.map((item, i) => (
          <Row
            key={i}
            meta={`${i + 1}. ${item.id ? `#${item.id} · ` : ""}${item.tag || SUGGESTION_TAG}`}
            onRemove={() => setAp("plan", removeAt(planItems, i))}
          >
            <TextArea label="Action" value={item.action} onChange={(v) => setPlanItem(i, { action: v })} />
            <TextArea label="Why" value={item.why} onChange={(v) => setPlanItem(i, { why: v })} />
            <TextArea label="Record (patient record source)" value={item.source?.patient_record} onChange={(v) => setPlanSource(i, "patient_record", v)} />
            <TextArea label="Reference (Harrison)" value={item.source?.harrison} onChange={(v) => setPlanSource(i, "harrison", v)} />
          </Row>
        ))}
        <AddButton
          label="Add plan item"
          onClick={() =>
            setAp("plan", [
              ...planItems,
              { id: newId("plan", planItems), action: "", why: "", source: { patient_record: "", harrison: "" }, tag: SUGGESTION_TAG },
            ])
          }
        />
      </Card>

      <Card title="Interaction and safety">
        {safety.map((item, i) => (
          <Row key={i} meta={item.mark || "needs attention"} onRemove={() => setAp("interaction_and_safety", removeAt(safety, i))}>
            <TextArea label="Text" value={item.text} onChange={(v) => setSafety(i, { text: v })} />
            <TextArea label="Source" value={item.source} onChange={(v) => setSafety(i, { source: v })} />
          </Row>
        ))}
        <AddButton
          label="Add safety check"
          onClick={() => setAp("interaction_and_safety", [...safety, { mark: "needs attention", text: "", source: "" }])}
        />
      </Card>

      <Card title="Prevention">
        {prevention.map((item, i) => (
          <Row
            key={i}
            meta={item.id ? `#${item.id}` : `Item ${i + 1}`}
            onRemove={() => setTop("prevention_checklist", removeAt(prevention, i))}
          >
            <TextInput label="Item" value={item.action || item.item} onChange={(v) => setPrevention(i, { action: v })} />
            <TextArea label="Status or reason" value={item.reason} onChange={(v) => setPrevention(i, { reason: v })} />
            <TextArea label="Source" value={item.source} onChange={(v) => setPrevention(i, { source: v })} />
          </Row>
        ))}
        <AddButton
          label="Add prevention item"
          onClick={() => setTop("prevention_checklist", [...prevention, { id: newId("prev", prevention), action: "", reason: "", source: "" }])}
        />
      </Card>

      <Card title="Physician actions">
        {actions.map((item, i) => (
          <Row key={i} meta={`Action ${i + 1}`} onRemove={() => setTop("physician_actions", removeAt(actions, i))}>
            <TextInput label="Item" value={item.item} onChange={(v) => setAction(i, { item: v })} />
            <TextArea label="Action" value={item.action} onChange={(v) => setAction(i, { action: v })} />
          </Row>
        ))}
        <AddButton label="Add action" onClick={() => setTop("physician_actions", [...actions, { item: "", action: "" }])} />
      </Card>

      <Card title="Note for patient">
        <TextArea label="Note for patient" value={draft.patient_note} onChange={(v) => setTop("patient_note", v)} rows={3} />
      </Card>

      <Card title="Feedback on this AI plan">
        <TextArea
          label="Accept, edit or override, and any correction for the model"
          value={draft.model_feedback}
          onChange={(v) => setTop("model_feedback", v)}
          rows={3}
        />
      </Card>
    </div>
  );
}
