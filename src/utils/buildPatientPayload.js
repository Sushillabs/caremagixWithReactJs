const BACKEND_PATIENT_TYPE = { Pcc: "PCC", Epic: "epic", Metriport: "metriport" };

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
