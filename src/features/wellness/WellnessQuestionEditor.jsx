import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import {
  addClinicianWellnessQuestion,
  deleteClinicianWellnessQuestion,
  getClinicianWellnessQuestions,
  reorderClinicianWellnessQuestions,
  resetClinicianWellnessQuestions,
  updateClinicianWellnessQuestion,
} from "../../api/hospitalApi";

// Physician + caregiver question editor for one patient's Wellness Check-in.
// Same backend routes for both roles (/hf-wellness/clinician/*); the list is
// already scoped server-side and the patient is resolved from the name
// PatientDetails already holds, so no patient_key lookup happens here.

// Backend always gets the raw key (see ANSWER_TYPES below) — these are only
// the friendly labels shown in the UI. "integer" is a valid backend type but
// isn't offered as a choice here; "number" covers it for new/edited questions.
const ANSWER_TYPE_LABELS = {
  text: "Text",
  enum: "Selection / Choice",
  boolean: "Yes/No",
  number: "Number",
};
const ANSWER_TYPES = ["text", "enum", "boolean", "number"];

const ZONE_CHOICES = [
  { key: "green", label: "Green", on: "bg-emerald-600 text-white border-emerald-600", off: "border-gray-200 text-gray-500 hover:bg-emerald-50" },
  { key: "yellow", label: "Yellow", on: "bg-amber-500 text-white border-amber-500", off: "border-gray-200 text-gray-500 hover:bg-amber-50" },
  { key: "red", label: "Red", on: "bg-red-600 text-white border-red-600", off: "border-gray-200 text-gray-500 hover:bg-red-50" },
];
const OPERATORS = [">=", "<=", ">", "<", "=="];
const MAX_ZONE_VALUES = 12;
const MAX_ZONE_VALUE_LEN = 80;

const apiMessage = (err) => err?.response?.data?.message || err?.message || "Something went wrong";
const titleCase = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const optionList = (text) =>
  (text || "")
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);

// Number zones travel as one operator+value string, e.g. ">=2" or "<88".
const parseRule = (list) => {
  const raw = (list || [])[0] || "";
  const m = raw.match(/^\s*(>=|<=|==|=|>|<)\s*(-?\d+(?:\.\d+)?)\s*$/);
  return m ? { op: m[1] === "=" ? "==" : m[1], value: m[2] } : { op: ">=", value: "" };
};
const ruleToList = (rule) => (rule.value.trim() === "" ? [] : [`${rule.op}${rule.value.trim()}`]);

const blankDraft = (diagnosisKey = "") => ({
  prompt: "",
  answer_type: "text",
  options: "",
  is_core: false,
  field_key: "",
  diagnosis_key: diagnosisKey || "",
  yellow_answers: [],
  red_answers: [],
  yellow_rule: { op: ">=", value: "" },
  red_rule: { op: ">=", value: "" },
});

function draftFromQuestion(q) {
  const isNumber = q.answer_type === "number" || q.answer_type === "integer";
  return {
    prompt: q.prompt || "",
    answer_type: q.answer_type || "text",
    options: (q.options || []).join("\n"),
    is_core: !!q.is_core,
    field_key: q.field_key || "",
    diagnosis_key: q.diagnosis_key || "",
    yellow_answers: q.yellow_answers || [],
    red_answers: q.red_answers || [],
    yellow_rule: isNumber ? parseRule(q.yellow_answers) : { op: ">=", value: "" },
    red_rule: isNumber ? parseRule(q.red_answers) : { op: ">=", value: "" },
  };
}

// Draft -> request body. Options only travel for enum/boolean; empty strings
// become null so the backend clears rather than rejects them. Zone lists are
// always sent in full — the backend replaces them, so [] clears a zone.
function draftToBody(draft) {
  const body = {
    prompt: draft.prompt.trim(),
    answer_type: draft.answer_type,
    is_core: !!draft.is_core,
    field_key: draft.field_key.trim() || null,
    diagnosis_key: draft.diagnosis_key || null,
  };
  if (draft.answer_type === "enum" || draft.answer_type === "boolean") {
    const opts = optionList(draft.options);
    body.options = opts.length ? opts : null;
    body.yellow_answers = draft.yellow_answers.filter((a) => opts.includes(a));
    body.red_answers = draft.red_answers.filter((a) => opts.includes(a));
  } else if (draft.answer_type === "number" || draft.answer_type === "integer") {
    body.options = null;
    body.yellow_answers = ruleToList(draft.yellow_rule);
    body.red_answers = ruleToList(draft.red_rule);
  } else {
    body.options = null;
    body.yellow_answers = draft.yellow_answers;
    body.red_answers = draft.red_answers;
  }
  return body;
}

function zoneError(body) {
  for (const key of ["yellow_answers", "red_answers"]) {
    const list = body[key] || [];
    const zone = key === "yellow_answers" ? "yellow" : "red";
    if (list.length > MAX_ZONE_VALUES) return `At most ${MAX_ZONE_VALUES} ${zone} answers are allowed.`;
    if (list.some((v) => v.length > MAX_ZONE_VALUE_LEN)) return `Each ${zone} answer must be ${MAX_ZONE_VALUE_LEN} characters or fewer.`;
  }
  return null;
}

function ZoneRuleRow({ label, rule, onChange, tone }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-16 text-[11px] font-medium ${tone}`}>{label}</span>
      <select
        value={rule.op}
        onChange={(e) => onChange({ ...rule, op: e.target.value })}
        className="rounded-md border border-gray-200 px-1.5 py-1 text-xs"
      >
        {OPERATORS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={rule.value}
        onChange={(e) => onChange({ ...rule, value: e.target.value })}
        placeholder="leave blank for none"
        className="w-36 rounded-md border border-gray-200 px-2 py-1 text-xs"
      />
    </div>
  );
}

function QuestionForm({ draft, setDraft, diagnosisOptions, onSubmit, onCancel, busy, submitLabel }) {
  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const showOptions = draft.answer_type === "enum" || draft.answer_type === "boolean";
  const isNumber = draft.answer_type === "number" || draft.answer_type === "integer";
  const opts = useMemo(() => optionList(draft.options), [draft.options]);

  const zoneOf = (opt) => (draft.red_answers.includes(opt) ? "red" : draft.yellow_answers.includes(opt) ? "yellow" : "green");
  const setZone = (opt, zone) =>
    setDraft((d) => ({
      ...d,
      yellow_answers: zone === "yellow" ? [...d.yellow_answers.filter((a) => a !== opt), opt] : d.yellow_answers.filter((a) => a !== opt),
      red_answers: zone === "red" ? [...d.red_answers.filter((a) => a !== opt), opt] : d.red_answers.filter((a) => a !== opt),
    }));

  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-2">
      <label className="block space-y-1">
        <span className="text-[11px] text-gray-600">Question the patient is asked</span>
        <textarea
          rows={2}
          value={draft.prompt}
          onChange={set("prompt")}
          maxLength={500}
          placeholder="e.g. What is your morning weight today?"
          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs"
        />
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[11px] text-gray-600">Answer type</span>
          <select value={draft.answer_type} onChange={set("answer_type")} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs">
            {ANSWER_TYPES.map((t) => (
              <option key={t} value={t}>
                {ANSWER_TYPE_LABELS[t] || titleCase(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[11px] text-gray-600">Diagnosis group</span>
          <select
            value={draft.diagnosis_key}
            onChange={set("diagnosis_key")}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs"
          >
            {/* <option value="">None (free-standing)</option> */}
            {diagnosisOptions.map((d) => (
              <option key={d.diagnosis_key} value={d.diagnosis_key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showOptions && (
        <label className="block space-y-1">
          <span className="text-[11px] text-gray-600">Options (one per line{draft.answer_type === "enum" ? ", at least 2" : ""})</span>
          <textarea
            rows={3}
            value={draft.options}
            onChange={set("options")}
            placeholder={"None\nMild\nModerate\nSevere"}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs"
          />
        </label>
      )}

      {(showOptions || isNumber) && (
        <div className="space-y-1.5 rounded-md border border-gray-200 bg-white p-2">
          <p className="text-[11px] text-gray-600">
            Mark which answers put this patient in the yellow or red zone. A yellow or red answer will offer an urgent physician visit in the
            patient's wellness check-in.
          </p>

          {showOptions &&
            (opts.length === 0 ? (
              <p className="text-[11px] text-gray-400">Add options above to mark their zones.</p>
            ) : (
              opts.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{opt}</span>
                  <div className="flex shrink-0 gap-1">
                    {ZONE_CHOICES.map((z) => (
                      <button
                        key={z.key}
                        type="button"
                        onClick={() => setZone(opt, z.key)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${zoneOf(opt) === z.key ? z.on : z.off}`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ))}

          {isNumber && (
            <div className="space-y-1.5">
              <ZoneRuleRow
                label="Yellow if"
                tone="text-amber-600"
                rule={draft.yellow_rule}
                onChange={(rule) => setDraft((d) => ({ ...d, yellow_rule: rule }))}
              />
              <ZoneRuleRow label="Red if" tone="text-red-600" rule={draft.red_rule} onChange={(rule) => setDraft((d) => ({ ...d, red_rule: rule }))} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <input type="checkbox" checked={draft.is_core} onChange={set("is_core")} />
          Required (coach asks first)
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <span>field_key</span>
          <input
            type="text"
            value={draft.field_key}
            onChange={set("field_key")}
            placeholder="optional, e.g. weight_lb"
            className="w-40 rounded-md border border-gray-200 px-2 py-1 text-xs"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || !draft.prompt.trim()}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuestionRow({ q, canMoveUp, canMoveDown, onEdit, onDelete, onMove, busy }) {
  const yellow = q.yellow_answers || [];
  const red = q.red_answers || [];
  const isNumber = q.answer_type === "number" || q.answer_type === "integer";
  const pillClass = (opt) =>
    red.includes(opt)
      ? "border-red-300 bg-red-50 text-red-700"
      : yellow.includes(opt)
        ? "border-amber-300 bg-amber-50 text-amber-700"
        : "border-gray-200 text-gray-500";

  return (
    <div className="flex items-start gap-2 rounded-md border border-gray-100 p-2 text-xs">
      <div className="flex flex-col">
        <button
          type="button"
          disabled={!canMoveUp || busy}
          onClick={() => onMove(-1)}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          disabled={!canMoveDown || busy}
          onClick={() => onMove(1)}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-gray-700">{q.prompt}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{ANSWER_TYPE_LABELS[q.answer_type] || q.answer_type}</span>
          {q.origin === "custom" && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">Custom</span>}
          {q.is_core && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Required</span>}
          {q.field_key && <span className="text-[10px] text-gray-400">{q.field_key}</span>}
          {(q.options || []).map((opt) => (
            <span key={opt} className={`rounded-full border px-1.5 py-0.5 text-[10px] ${pillClass(opt)}`}>
              {opt}
            </span>
          ))}
          {isNumber && yellow.map((r) => (
            <span key={`y-${r}`} className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
              Yellow {r}
            </span>
          ))}
          {isNumber && red.map((r) => (
            <span key={`r-${r}`} className="rounded-full border border-red-300 bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">
              Red {r}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={onEdit} disabled={busy} className="text-gray-400 hover:text-emerald-600 disabled:opacity-30" title="Edit">
          <Pencil size={13} />
        </button>
        <button type="button" onClick={onDelete} disabled={busy} className="text-gray-400 hover:text-red-600 disabled:opacity-30" title="Remove">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function WellnessQuestionEditor({ patientName }) {
  const [payload, setPayload] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blankDraft());

  // The backend resolves the patient from the name PatientDetails already has.
  useEffect(() => {
    if (!patientName) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setForbidden(false);
    setEditingId(null);
    setAdding(false);
    getClinicianWellnessQuestions(patientName)
      .then((data) => {
        if (!alive) return;
        setPayload(data);
        setRows(data?.questions || []);
      })
      .catch((err) => {
        if (!alive) return;
        if (err?.response?.status === 403) setForbidden(true);
        else setError(apiMessage(err));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [patientName]);

  const diagnosisOptions = useMemo(() => {
    const seen = new Map();
    (payload?.matched_diagnoses || []).forEach((d) => seen.set(d.diagnosis_key, d.label || titleCase(d.diagnosis_key)));
    rows.forEach((q) => {
      if (q.diagnosis_key && !seen.has(q.diagnosis_key)) seen.set(q.diagnosis_key, titleCase(q.diagnosis_key));
    });
    return [...seen.entries()].map(([diagnosis_key, label]) => ({ diagnosis_key, label }));
  }, [payload, rows]);

  const labelFor = (key) => diagnosisOptions.find((d) => d.diagnosis_key === key)?.label || (key ? titleCase(key) : "Other");

  // Render groups in matched-diagnosis order, then leftovers, then null last.
  const groups = useMemo(() => {
    const order = [...diagnosisOptions.map((d) => d.diagnosis_key), null];
    return order
      .map((key) => ({ key, label: labelFor(key), items: rows.filter((q) => (q.diagnosis_key || null) === key) }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, diagnosisOptions]);

  const runReorder = async (nextRows) => {
    setRows(nextRows);
    setBusy(true);
    setFormError(null);
    try {
      const data = await reorderClinicianWellnessQuestions(
        patientName,
        nextRows.map((q) => q.id)
      );
      setPayload(data);
      setRows(data?.questions || nextRows);
    } catch (err) {
      setFormError(apiMessage(err));
      setRows(rows); // roll back
    } finally {
      setBusy(false);
    }
  };

  const move = (id, dir) => {
    const idx = rows.findIndex((q) => q.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= rows.length) return;
    const next = [...rows];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    runReorder(next);
  };

  const saveEdit = async () => {
    const body = draftToBody(draft);
    const invalid = zoneError(body);
    if (invalid) return setFormError(invalid);
    setBusy(true);
    setFormError(null);
    try {
      const { question } = await updateClinicianWellnessQuestion(patientName, editingId, body);
      setRows((prev) => prev.map((q) => (q.id === question.id ? question : q)));
      setEditingId(null);
    } catch (err) {
      setFormError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const saveAdd = async () => {
    const body = draftToBody(draft);
    const invalid = zoneError(body);
    if (invalid) return setFormError(invalid);
    setBusy(true);
    setFormError(null);
    try {
      const { question } = await addClinicianWellnessQuestion(patientName, body);
      setRows((prev) => [...prev, question]);
      setAdding(false);
    } catch (err) {
      setFormError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeQuestion = async (id) => {
    if (!window.confirm("Hide this question from the patient's check-in?")) return;
    setBusy(true);
    setFormError(null);
    try {
      await deleteClinicianWellnessQuestion(patientName, id);
      setRows((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setFormError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resetAll = async () => {
    if (
      !window.confirm(
        "This restores the default questions and the default yellow/red zones for this patient's diagnoses, and removes questions you added. Continue?"
      )
    )
      return;
    setBusy(true);
    setFormError(null);
    try {
      const data = await resetClinicianWellnessQuestions(patientName);
      setPayload(data);
      setRows(data?.questions || []);
      setEditingId(null);
      setAdding(false);
    } catch (err) {
      setFormError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (q) => {
    setAdding(false);
    setEditingId(q.id);
    setDraft(draftFromQuestion(q));
    setFormError(null);
  };
  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setDraft(blankDraft());
    setFormError(null);
  };

  if (forbidden) return <p className="p-4 text-xs text-gray-500">You don't have access to edit this patient's check-in questions.</p>;
  if (loading) return <p className="p-4 text-sm text-gray-400">Loading questions...</p>;
  if (error) return <p className="p-4 text-sm text-red-600">Error: {error}</p>;

  if (!patientName) {
    return <p className="p-4 text-xs text-gray-500">Select a patient to edit their check-in questions.</p>;
  }

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-gray-500">{payload?.patient_display_name || patientName}</span>
          {(payload?.matched_diagnoses || []).map((d) => (
            <span key={d.diagnosis_key} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700" title={d.source_text || ""}>
              {d.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startAdd}
            disabled={busy}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Plus size={12} /> Add question
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={busy}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-red-700">
          <span className="flex-1">{formError}</span>
          <button type="button" onClick={() => setFormError(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      {adding && (
        <QuestionForm
          draft={draft}
          setDraft={setDraft}
          diagnosisOptions={diagnosisOptions}
          onSubmit={saveAdd}
          onCancel={() => setAdding(false)}
          busy={busy}
          submitLabel="Add question"
        />
      )}

      {rows.length === 0 && !adding && <p className="text-gray-400">No active questions. Add one, or Reset to load the diagnosis defaults.</p>}

      {groups.map((group) => (
        <div key={group.key || "none"} className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{group.label}</div>
          {group.items.map((q) => {
            const idx = rows.findIndex((r) => r.id === q.id);
            const prev = rows[idx - 1];
            const next = rows[idx + 1];
            return editingId === q.id ? (
              <QuestionForm
                key={q.id}
                draft={draft}
                setDraft={setDraft}
                diagnosisOptions={diagnosisOptions}
                onSubmit={saveEdit}
                onCancel={() => setEditingId(null)}
                busy={busy}
                submitLabel="Save changes"
              />
            ) : (
              <QuestionRow
                key={q.id}
                q={q}
                canMoveUp={!!prev && (prev.diagnosis_key || null) === (q.diagnosis_key || null)}
                canMoveDown={!!next && (next.diagnosis_key || null) === (q.diagnosis_key || null)}
                onEdit={() => startEdit(q)}
                onDelete={() => removeQuestion(q.id)}
                onMove={(dir) => move(q.id, dir)}
                busy={busy}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
