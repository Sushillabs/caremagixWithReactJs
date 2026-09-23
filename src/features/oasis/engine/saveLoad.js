import { useCallback, useEffect, useRef, useState } from "react";
import { saveOasisForm, getOasisForm, clearOasisForm } from "../api/oasisApi";
import { applySkipMarks } from "./skipLogic";
import { collectPayload } from "./payload";

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
export function useOasisSaveLoad({ formKey, patientId, patientName, schema }) {
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

  const clearLocalDraft = useCallback(
    () => localStorage.removeItem(draftKey(formKey, patientId)),
    [formKey, patientId]
  );

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
      // Backend requires patient_id to update (aerial-view doc §I) — mirror legacy's
      // client-side block so a save never fires a request we know will 400.
      if (!patientId) {
        setStatus("error");
        throw new Error("Patient id is required to save.");
      }
      setStatus("saving");
      const payload = applySkipMarks(schema, collectPayload(schema, values));
      try {
        await saveOasisForm({
          patient_name: patientName,
          patient_id: patientId,
          form_name: formKey,
          submitted_at: new Date().toISOString(),
          raw_data: payload,
          mapped_data: payload,
          ...(patientDetails ? { patient_details: patientDetails } : {}),
        });
        setStatus("saved");
      } catch (err) {
        setStatus("error");
        throw err;
      }
    },
    [formKey, patientId, patientName, schema]
  );

  const loadFromServer = useCallback(async () => {
    const res = await getOasisForm({ patient_name: patientName, patient_id: patientId, form_name: formKey });
    return {
      values: res?.raw_data || res?.mapped_data || null,
      patientDetails: res?.patient_details ?? null,
    };
  }, [formKey, patientId, patientName]);

  const clearOnServer = useCallback(async () => {
    clearLocalDraft();
    if (!patientId && !patientName) return;
    await clearOasisForm({ patient_id: patientId, patient_name: patientName, form_name: formKey });
  }, [clearLocalDraft, formKey, patientId, patientName]);

  return { status, scheduleLocalSave, loadLocalDraft, clearLocalDraft, saveToServer, loadFromServer, clearOnServer };
}
