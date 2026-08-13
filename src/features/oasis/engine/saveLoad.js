import { useCallback, useEffect, useRef, useState } from "react";
import { saveOasisForm, getOasisForm } from "../api/oasisApi";

const AUTOSAVE_DEBOUNCE_MS = 1500;

function draftKey(formKey, patientId) {
  return `oasis_draft_${formKey}_${patientId}`;
}

/**
 * Local draft (debounced, every change) + server save/load for one OASIS form
 * instance. Load-on-open is normalized across all 6 forms (aerial-view doc §B) —
 * always fetch, unlike legacy where SOC/DAH/TRN skipped it in fill mode. This hook
 * only exposes `loadFromServer`; when to call it (mount, mode, etc.) is the Form
 * Shell's decision (Phase 1), not this hook's.
 */
export function useOasisSaveLoad({ formKey, patientId, patientName }) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const saveLocalDraft = useCallback(
    (values) => localStorage.setItem(draftKey(formKey, patientId), JSON.stringify(values)),
    [formKey, patientId]
  );

  const loadLocalDraft = useCallback(() => {
    const raw = localStorage.getItem(draftKey(formKey, patientId));
    return raw ? JSON.parse(raw) : null;
  }, [formKey, patientId]);

  // Debounced local draft on every change — server save stays an explicit action,
  // matching legacy's scheduleSave()/doLocalSave() split.
  const scheduleLocalSave = useCallback(
    (values) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveLocalDraft(values), AUTOSAVE_DEBOUNCE_MS);
    },
    [saveLocalDraft]
  );

  const saveToServer = useCallback(
    async (values, { patientDetails } = {}) => {
      setStatus("saving");
      try {
        await saveOasisForm({
          patient_name: patientName,
          patient_id: patientId,
          form_name: formKey,
          submitted_at: new Date().toISOString(),
          raw_data: values,
          mapped_data: values, // same payload key legacy sends today — no client mapping (§E)
          ...(patientDetails ? { patient_details: patientDetails } : {}),
        });
        setStatus("saved");
      } catch (err) {
        setStatus("error");
        throw err;
      }
    },
    [formKey, patientId, patientName]
  );

  const loadFromServer = useCallback(async () => {
    const res = await getOasisForm({ patient_name: patientName, patient_id: patientId, form_name: formKey });
    return res?.raw_data || res?.mapped_data || null;
  }, [formKey, patientId, patientName]);

  return { status, scheduleLocalSave, loadLocalDraft, saveToServer, loadFromServer };
}
