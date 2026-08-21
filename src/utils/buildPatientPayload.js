const BACKEND_PATIENT_TYPE = { Pcc: "PCC", Epic: "epic", Metriport: "metriport" };

// Stable identity for a patient, for anything that needs to survive across
// navigation (e.g. care-plan job tracking). NOT the same as patient.id —
// that's a crypto.randomUUID() regenerated fresh every time PatientsList
// refetches, so it's useless as a durable key. patient_name + patient_type
// don't change between fetches, and it's also literally what the backend
// itself uses to identify a patient's care plan (see careplan.py's
// CarePlan.query.filter_by(patient_name=..., patient_type=...)).
export function getPatientKey(patient_name, patient_type) {
  return `${(patient_name || "").trim().toLowerCase()}::${(patient_type || "").trim().toLowerCase()}`;
}

// TEMPORARY frontend workaround for a backend bug: /generate_care_plan saves
// the plan under a lowercased+trimmed patient_name (careplan/routes.py:484)
// UNLESS patient_type is one of these four — but the dashboard-by-name
// lookup (GET /care_plan/dashboard) does an exact match on whatever name is
// sent, no lowercasing. Sending the raw name there 404s even when the plan
// exists. Mirror the exact same save-time rule here so the lookup matches.
// Remove this once the backend normalizes both sides the same way.
const CARE_PLAN_EXACT_CASE_PATIENT_TYPES = ["EHR", "PCC", "ICD-Codes", "CPT-Codes"];

export function getCarePlanLookupName(patient_name, patient_type) {
  const name = (patient_name || "").trim();
  return CARE_PLAN_EXACT_CASE_PATIENT_TYPES.includes(patient_type) ? name : name.toLowerCase();
}

export function buildPatientPayload(p, user_id) {
  if (p?.type === "Uploaded") {
    const firstDoc = p.raw?.data?.[0];
    return {
      patient_name: p.name,
      patient_type: firstDoc?.patient_type,
      dates: firstDoc?.dates,
      patient_date: firstDoc?.dates,
      user_id,
      patient: p,
    };
  }

  return {
    patient_name: p.name,
    patient_type: BACKEND_PATIENT_TYPE[p?.type],
    patient_collection: p.details?.[0],
    user_id,
    patient: p,
  };
}
