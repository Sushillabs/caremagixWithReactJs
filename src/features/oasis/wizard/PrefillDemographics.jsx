import { useState } from "react";
import { PAY_SOURCES, US_STATES, ymdToISO, isoToYMD } from "./wizardOptions";

const inputCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400";
const labelCls = "mb-1 block text-xs font-medium text-gray-600";
const cbRowCls = "mt-1 flex items-center gap-1.5 text-xs text-gray-600";

function buildInitialFields(pd) {
  const v = (k) => pd[k] ?? "";
  return {
    M0018_PHYSICIAN_ID: v("M0018_PHYSICIAN_ID"),
    M0018_UK: v("M0018_UK") === "1",
    M0014_BRANCH_STATE: v("M0014_BRANCH_STATE"),
    M0016_BRANCH_ID: v("M0016_BRANCH_ID"),
    M0030_START_CARE_DT: ymdToISO(v("M0030_START_CARE_DT")),
    M0032_ROC_DT: ymdToISO(v("M0032_ROC_DT")),
    M0032_NA: v("M0032_NA") === "1",
    M0050_PAT_ST: v("M0050_PAT_ST"),
    M0060_PAT_ZIP: v("M0060_PAT_ZIP"),
    M0063_MEDICARE_NUM: v("M0063_MEDICARE_NUM"),
    M0063_MEDICARE_NA: v("M0063_MEDICARE_NA") === "1",
    M0064_SSN: v("M0064_SSN"),
    M0064_SSN_UK: v("M0064_SSN_UK") === "1",
    M0065_MEDICAID_NUM: v("M0065_MEDICAID_NUM"),
    M0065_MEDICAID_NA: v("M0065_MEDICAID_NA") === "1",
    M0066_PAT_BIRTH_DT: ymdToISO(v("M0066_PAT_BIRTH_DT")),
    A0810: v("A0810"),
    GG0170Q3: v("GG0170Q3") || "0",
    GG0170RR3: v("GG0170RR3") || "^",
    GG0170SS3: v("GG0170SS3") || "^",
    M1307_OLDST_STG2_ONST_DT: ymdToISO(v("M1307_OLDST_STG2_ONST_DT")),
    ...Object.fromEntries(PAY_SOURCES.map(([id]) => [id, v(id) === "1"])),
  };
}

export default function PrefillDemographics({ formLabel, isExisting, initialName, initialPatientDetails, onBack, onSubmit }) {
  const [firstName, setFirstName] = useState(initialName.first_name || "");
  const [mi, setMi] = useState(initialName.mi || "");
  const [lastName, setLastName] = useState(initialName.last_name || "");
  const [suffix, setSuffix] = useState(initialName.suffix || "");
  const [fields, setFields] = useState(() => buildInitialFields(initialPatientDetails || {}));
  const [readOnly, setReadOnly] = useState(isExisting);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setFields((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const errs = [];
    if (!firstName.trim()) errs.push("First name");
    if (!lastName.trim()) errs.push("Last name");
    if (!fields.M0030_START_CARE_DT) errs.push("Start of care date (M0030)");
    if (!fields.M0050_PAT_ST) errs.push("Patient state (M0050)");
    if (!fields.M0060_PAT_ZIP) errs.push("Patient ZIP (M0060)");
    if (!fields.M0066_PAT_BIRTH_DT) errs.push("Date of birth (M0066)");
    if (!fields.A0810) errs.push("Sex (A0810)");

    if (errs.length) {
      setStatus({ kind: "error", text: "Required: " + errs.join(", ") });
      return;
    }

    const patientDetails = {
      M0018_PHYSICIAN_ID: fields.M0018_PHYSICIAN_ID.trim(),
      M0018_UK: fields.M0018_UK ? "1" : "0",
      M0014_BRANCH_STATE: fields.M0014_BRANCH_STATE,
      M0016_BRANCH_ID: fields.M0016_BRANCH_ID.trim() || "N",
      M0030_START_CARE_DT: isoToYMD(fields.M0030_START_CARE_DT),
      M0032_ROC_DT: isoToYMD(fields.M0032_ROC_DT),
      M0032_NA: fields.M0032_NA ? "1" : "0",
      M0050_PAT_ST: fields.M0050_PAT_ST,
      M0060_PAT_ZIP: fields.M0060_PAT_ZIP.trim(),
      M0063_MEDICARE_NUM: fields.M0063_MEDICARE_NUM.trim(),
      M0063_MEDICARE_NA: fields.M0063_MEDICARE_NA ? "1" : "0",
      M0064_SSN: fields.M0064_SSN.trim(),
      M0064_SSN_UK: fields.M0064_SSN_UK ? "1" : "0",
      M0065_MEDICAID_NUM: fields.M0065_MEDICAID_NUM.trim(),
      M0065_MEDICAID_NA: fields.M0065_MEDICAID_NA ? "1" : "0",
      M0066_PAT_BIRTH_DT: isoToYMD(fields.M0066_PAT_BIRTH_DT),
      A0810: fields.A0810,
      GG0170Q3: fields.GG0170Q3,
      GG0170RR3: fields.GG0170RR3,
      GG0170SS3: fields.GG0170SS3,
      M1307_OLDST_STG2_ONST_DT: isoToYMD(fields.M1307_OLDST_STG2_ONST_DT),
      M0040_first: firstName.trim(),
      M0040_mi: mi.trim(),
      M0040_last: lastName.trim(),
      M0040_suffix: suffix.trim(),
    };
    PAY_SOURCES.forEach(([id]) => {
      patientDetails[id] = fields[id] ? "1" : "0";
    });

    const patientName = [firstName.trim(), mi.trim(), lastName.trim(), suffix.trim()].filter(Boolean).join(" ");

    setBusy(true);
    setStatus({ kind: "info", text: "Saving patient data…" });
    try {
      await onSubmit({ patientName, patientDetails });
    } catch (err) {
      setStatus({ kind: "error", text: err.message || "Save failed." });
      setBusy(false);
    }
  };

  const statusColor = { ok: "text-emerald-600", error: "text-red-600", info: "text-blue-600" }[status?.kind] || "text-gray-500";

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Step 3 of 3 · Patient Details</p>
      <p className="mb-4 text-sm font-semibold text-gray-800">{formLabel}</p>

      {isExisting && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
          <span className="text-xs text-amber-700">
            {readOnly ? "🔒 Patient data shown is read-only. Click Edit to make changes." : "🔓 Edit mode enabled."}
          </span>
          <button
            type="button"
            onClick={() => setReadOnly((r) => !r)}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            {readOnly ? "Edit" : "Cancel Edit"}
          </button>
        </div>
      )}

      <label className={labelCls}>Patient Name *</label>
      <div className="mb-3 flex gap-2">
        <input value={firstName} disabled={readOnly} onChange={(e) => setFirstName(e.target.value)} placeholder="First" className={`${inputCls} flex-1`} />
        <input value={mi} disabled={readOnly} onChange={(e) => setMi(e.target.value)} placeholder="MI" maxLength={1} className={`${inputCls} w-12`} />
        <input value={lastName} disabled={readOnly} onChange={(e) => setLastName(e.target.value)} placeholder="Last" className={`${inputCls} flex-1`} />
        <input value={suffix} disabled={readOnly} onChange={(e) => setSuffix(e.target.value)} placeholder="Suf" maxLength={4} className={`${inputCls} w-14`} />
      </div>

      <hr className="my-3 border-gray-200" />
      <p className="mb-2 text-xs font-semibold uppercase text-blue-900">Agency & Visit</p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Physician NPI (M0018)</label>
          <input value={fields.M0018_PHYSICIAN_ID} disabled={readOnly} onChange={(e) => set("M0018_PHYSICIAN_ID", e.target.value)} maxLength={10} placeholder="10-digit NPI" className={inputCls} />
          <label className={cbRowCls}>
            <input type="checkbox" checked={fields.M0018_UK} disabled={readOnly} onChange={(e) => set("M0018_UK", e.target.checked)} /> NPI Unknown
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Branch State (M0014)</label>
            <select value={fields.M0014_BRANCH_STATE} disabled={readOnly} onChange={(e) => set("M0014_BRANCH_STATE", e.target.value)} className={inputCls}>
              <option value="^">^ No branch</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Branch ID (M0016)</label>
            <input value={fields.M0016_BRANCH_ID} disabled={readOnly} onChange={(e) => set("M0016_BRANCH_ID", e.target.value)} placeholder="N / P / ID" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Start of Care Date (M0030) *</label>
          <input type="date" value={fields.M0030_START_CARE_DT} disabled={readOnly} onChange={(e) => set("M0030_START_CARE_DT", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Resumption of Care Date (M0032)</label>
          <input type="date" value={fields.M0032_ROC_DT} disabled={readOnly} onChange={(e) => set("M0032_ROC_DT", e.target.value)} className={inputCls} />
          <label className={cbRowCls}>
            <input type="checkbox" checked={fields.M0032_NA} disabled={readOnly} onChange={(e) => set("M0032_NA", e.target.checked)} /> N/A — not a resumption
          </label>
        </div>
      </div>

      <hr className="my-3 border-gray-200" />
      <p className="mb-2 text-xs font-semibold uppercase text-blue-900">Patient Demographics</p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Patient State (M0050) *</label>
          <select value={fields.M0050_PAT_ST} disabled={readOnly} onChange={(e) => set("M0050_PAT_ST", e.target.value)} className={inputCls}>
            <option value="">— select —</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Patient ZIP (M0060) *</label>
          <input value={fields.M0060_PAT_ZIP} disabled={readOnly} onChange={(e) => set("M0060_PAT_ZIP", e.target.value)} maxLength={9} placeholder="e.g. 91942" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Date of Birth (M0066) *</label>
          <input type="date" value={fields.M0066_PAT_BIRTH_DT} disabled={readOnly} onChange={(e) => set("M0066_PAT_BIRTH_DT", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sex (A0810) *</label>
          <select value={fields.A0810} disabled={readOnly} onChange={(e) => set("A0810", e.target.value)} className={inputCls}>
            <option value="">— select —</option>
            <option value="1">1 — Male</option>
            <option value="2">2 — Female</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Medicare Number (M0063)</label>
          <input value={fields.M0063_MEDICARE_NUM} disabled={readOnly} onChange={(e) => set("M0063_MEDICARE_NUM", e.target.value)} maxLength={13} placeholder="e.g. 1EG4TE5MK73" className={inputCls} />
          <label className={cbRowCls}>
            <input type="checkbox" checked={fields.M0063_MEDICARE_NA} disabled={readOnly} onChange={(e) => set("M0063_MEDICARE_NA", e.target.checked)} /> No Medicare number
          </label>
        </div>
        <div>
          <label className={labelCls}>SSN (M0064)</label>
          <input value={fields.M0064_SSN} disabled={readOnly} onChange={(e) => set("M0064_SSN", e.target.value)} maxLength={9} placeholder="9 digits no dashes" className={inputCls} />
          <label className={cbRowCls}>
            <input type="checkbox" checked={fields.M0064_SSN_UK} disabled={readOnly} onChange={(e) => set("M0064_SSN_UK", e.target.checked)} /> SSN Unknown
          </label>
        </div>
        <div>
          <label className={labelCls}>Medicaid Number (M0065)</label>
          <input value={fields.M0065_MEDICAID_NUM} disabled={readOnly} onChange={(e) => set("M0065_MEDICAID_NUM", e.target.value)} placeholder="Medicaid ID" className={inputCls} />
          <label className={cbRowCls}>
            <input type="checkbox" checked={fields.M0065_MEDICAID_NA} disabled={readOnly} onChange={(e) => set("M0065_MEDICAID_NA", e.target.checked)} /> No Medicaid number
          </label>
        </div>
      </div>

      <hr className="my-3 border-gray-200" />
      <p className="mb-2 text-xs font-semibold uppercase text-blue-900">Payment Sources (M0150)</p>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {PAY_SOURCES.map(([id, lbl]) => (
          <label key={id} className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-700">
            <input type="checkbox" checked={fields[id]} disabled={readOnly} onChange={(e) => set(id, e.target.checked)} /> {lbl}
          </label>
        ))}
      </div>

      <hr className="my-3 border-gray-200" />
      <p className="mb-2 text-xs font-semibold uppercase text-blue-900">Wheelchair / Scooter (GG0170)</p>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Uses WC/Scooter (GG0170Q3)</label>
          <select value={fields.GG0170Q3} disabled={readOnly} onChange={(e) => set("GG0170Q3", e.target.value)} className={inputCls}>
            <option value="0">0 — No</option>
            <option value="1">1 — Yes</option>
            <option value="-">- — Not assessed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>WC Type 50ft (GG0170RR3)</label>
          <select value={fields.GG0170RR3} disabled={readOnly} onChange={(e) => set("GG0170RR3", e.target.value)} className={inputCls}>
            <option value="^">^ — Skip</option>
            <option value="1">1 — Manual</option>
            <option value="2">2 — Motorized</option>
            <option value="-">- — Not assessed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>WC Type 150ft (GG0170SS3)</label>
          <select value={fields.GG0170SS3} disabled={readOnly} onChange={(e) => set("GG0170SS3", e.target.value)} className={inputCls}>
            <option value="^">^ — Skip</option>
            <option value="1">1 — Manual</option>
            <option value="2">2 — Motorized</option>
            <option value="-">- — Not assessed</option>
          </select>
        </div>
      </div>

      <hr className="my-3 border-gray-200" />
      <p className="mb-2 text-xs font-semibold uppercase text-blue-900">Skin (if applicable)</p>
      <div className="mb-3">
        <label className={labelCls}>Oldest Stage 2 Ulcer Onset Date (M1307) — only fill if M1307 = 02</label>
        <input type="date" value={fields.M1307_OLDST_STG2_ONST_DT} disabled={readOnly} onChange={(e) => set("M1307_OLDST_STG2_ONST_DT", e.target.value)} className={`${inputCls} max-w-50`} />
      </div>

      {status && <p className={`mb-2 text-xs ${statusColor}`}>{status.text}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onBack} disabled={busy} className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="flex-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save & Open Form →"}
        </button>
      </div>
    </div>
  );
}
