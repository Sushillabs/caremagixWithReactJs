import http from "./httpClient";

const API_BASE = import.meta.env.VITE_API_URL;

// Streaming TTS uses raw fetch (not the axios `http` instance) — axios can't
// hand back a readable stream body, needed for chunked PCM playback. Shared
// by every voice-enabled feature (hf-wellness, physician-appointment,
// caregiver-ambient-ai, physician-ambient-note) — same endpoint shape on all.
function fetchVoiceSpeakStream(base, text, signal) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${base}/voice/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ text, stream: true }),
    signal,
  });
}

export const registerHospital = (data) => http.post("/org_register/hospital_verify", data);
export const getHospitals = () => http.get("/get_details?type=hospital");
export const verifyEmail = (data) => http.put("/org_register/hospital_edit", data);
export const signUpAPI = (data) => http.post("/register_category", data);
export const signInAPI = (data) => http.post("/login", data);
export const forgotPasswordAPI = (data) => http.post("/forgot_password", data);
export const getPatients = () => http.get("/retrieve-patient-name", { withAuth: true });
// Role-aware home dashboard counts — payload shape (which fields exist)
// depends on the logged-in user's role. See caremagix-be/dashboard/service.py.
export const getDashboardStats = () => http.get("/dashboard/stats", { withAuth: true }).then((res) => res.data);

// Dashboard tile drill-downs — the actual list behind a home-tile count.
// See caremagix-be/dashboard/{documents,careplans}.py + routes.py.
export const getDashboardDocuments = (params = {}) =>
  http.get("/dashboard/documents", { params, withAuth: true }).then((res) => res.data);
// A document's open_url/download_url need the JWT as a ?token= query param,
// not an Authorization header — they're opened via window.open(), which
// can't attach one.
export const getDashboardDocumentFileUrl = (relativeUrl) => {
  const token = localStorage.getItem("token");
  const sep = relativeUrl.includes("?") ? "&" : "?";
  return `${API_BASE}${relativeUrl}${sep}token=${encodeURIComponent(token || "")}`;
};
export const getDashboardActiveCarePlans = (patientName) =>
  http
    .get("/dashboard/active-care-plans", { params: patientName ? { patient_name: patientName } : {}, withAuth: true })
    .then((res) => res.data);
export const getPatientChat = (data) => http.post("/generate_questions", data, { withAuth: true });
export const askAPI = (data) => http.post("/ask", data, { withAuth: true });
export const getDocRef = (data) => http.post("/doc-ref", data, { withAuth: true });
export const uploadEFaxConfig = (data) => http.post("/getfax", data, { withAuth: true });
export const uploadPlan = (data) => http.post("/upload", data, { withAuth: true, isMultipart: true });
export const uploadPatientImage = (data) => http.post("/ocr-upload", data, { withAuth: true, isMultipart: true });
export const deletePatient = (patient_type, patient_name, patient_date) =>
  http.delete(`/delete_patient?patient_type=${patient_type}&patient_name=${patient_name}&dates=${patient_date}`, { withAuth: true });
export const getCallDetail = (data) => http.post("/get-details", data, { withAuth: true });
// Send Message feature reuses this same /get-details call (with a
// {patient_type, patient_name, medication: "yes"} payload) to look up the
// contact's phone number before sending — see SendMessageModal.jsx.
export const sendMessage = (data) => http.post("/send-message", data, { withAuth: true });
export const registerCall = (data) => http.post("/register-call", data, { withAuth: true });
export const unregisterCall = (data) => http.post("/pause_call", data, { withAuth: true });
export const mmta = (data) => http.post("/mmta", data, { withAuth: true });

export const mmtaV1 = (data) => http.post("/v1/mmta", data, { withAuth: true });
export const getPccData = () => http.get("/get_pcc_data", { withAuth: true });
export const getPccDataStatus = (jobId) => http.get(`/get_pcc_data/status/${jobId}`, { withAuth: true });
export const pullEpicData = () => http.get("/ehr_pull", { withAuth: true });
export const getEpicPullStatus = (jobId) => http.get(`/ehr_pull/status/${jobId}`, { withAuth: true });

// Epic SMART user-connect (v1) — caregiver signs into their own Epic account.
// Separate from /ehr_pull above, which uses the shared backend-services app.
export const getEpicConnectConfig = () => http.get("/v1/epic/config", { withAuth: true });
export const getEpicConnection = () => http.get("/v1/epic/connection", { withAuth: true });
// Backend defaults the return URL to the old caregiver-view.html, so always pass ours.
export const startEpicConnect = (frontendRedirect) =>
  http.get(`/v1/epic/connect/start?frontend_redirect=${encodeURIComponent(frontendRedirect)}`, { withAuth: true });
export const disconnectEpic = () => http.delete("/v1/epic/connection", { withAuth: true });
export const searchEpicPatients = ({ family, given, birthdate, name, _count = 20 } = {}) => {
  const params = new URLSearchParams();
  if (family) params.set("family", family);
  if (given) params.set("given", given);
  if (birthdate) params.set("birthdate", birthdate);
  if (name) params.set("name", name);
  params.set("_count", _count);
  return http.get(`/v1/epic/patients?${params.toString()}`, { withAuth: true });
};
export const startEpicUserPull = (body = {}) => http.post("/v1/epic/pull", body, { withAuth: true });
export const getEpicUserPullStatus = (jobId) => http.get(`/v1/epic/pull/${jobId}`, { withAuth: true });
export const getMetriportFacility = () => http.get("/get-facility", { withAuth: true });
export const createMetriportFacility = (data) => http.post("/create-facility", data, { withAuth: true });
export const updateMetriportFacility = (data) => http.put("/update-facility", data, { withAuth: true });
export const deleteMetriportFacility = () => http.delete("/delete-facility", { withAuth: true, data: {} });
export const pullMetriportPatients = (data) => http.post("/metriport/pull-patients-data", data, { withAuth: true });
export const getMetriportPullStatus = (jobId) => http.get(`/metriport/pull-patients-data/${jobId}`, { withAuth: true });
export const getProgress = (jobId) => http.get(`/ocr-progress/${jobId}`, { withAuth: true });
export const sendOTP = (data) => http.post("/send-otp", data, { withAuth: true });
export const verifyOTP = (data) => http.post("/verify-otp", data, { withAuth: true });
export const fillCMS485 = (data) => http.post("/get_filled_485", data, { withAuth: true });
export const getICDCodes = () => http.get(`/retrieve-patient-name?patient-type=ICD-Codes`, { withAuth: true });
export const getCPTCodes = () => http.get(`/retrieve-patient-name?patient-type=CPT-Codes`, { withAuth: true });
export const getCallReport = () => http.get(`/reports`, { withAuth: true });
export const generateCallReport = (data) => http.post("/generate_report", data, { withAuth: true });
export const getTcmPatients = () => http.get("/tcm/patients", { withAuth: true });
export const getTcmPatient = (patientKey) => http.get(`/tcm/patients/${encodeURIComponent(patientKey)}`, { withAuth: true });
export const getTcmPhysicians = (patientKey) =>
  http.get(`/tcm/physicians?patient_key=${encodeURIComponent(patientKey)}`, { withAuth: true });
export const scheduleTcmVisits = (data) => http.post("/tcm/schedule", data, { withAuth: true });
export const cancelTcmPlan = (planId) => http.post(`/tcm/plans/${encodeURIComponent(planId)}/cancel`, {}, { withAuth: true });
export const dischargePlan = (data) => http.post("/discharge_plan_agent", data, { withAuth: true });
export const edit_visit_template = () => http.get("/discharge_plan_agent/edit_template", { withAuth: true });
export const update_visit_template = (data) => http.post("/discharge_plan_agent/edit_template", data, { withAuth: true });
// note_kind-aware: caregiver passes none (backend picks by role); physician passes "discharge"/"handoff".
export const editNoteTemplate = (noteKind) => () =>
  http.get("/discharge_plan_agent/edit_template", { params: noteKind ? { note_kind: noteKind } : {}, withAuth: true });
export const updateNoteTemplate = (data) => http.post("/discharge_plan_agent/edit_template", data, { withAuth: true });
export const generateCarePlan = (data) => http.post("/v1/generate_care_plan", data, { withAuth: true });
export const getCarePlan = (carePlanId) => http.get(`/v1/care_plan/${carePlanId}`, { withAuth: true });
export const updateCarePlan = (carePlanId, care_plan_data) => http.put(`/v1/care_plan/${carePlanId}`, { care_plan_data }, { withAuth: true });
export const exportCarePlanPdf = (carePlanId) => http.post("/v1/export_care_plan_pdf", { care_plan_id: carePlanId }, { withAuth: true });
export const getCarePlanDashboard = (carePlanId) => http.get(`/v1/care_plan/${carePlanId}/dashboard`, { withAuth: true });
export const getCarePlanDashboardByPatient = (patientName, patientType) =>
  http.get(`/v1/care_plan/dashboard?patient_name=${encodeURIComponent(patientName)}&patient_type=${encodeURIComponent(patientType)}`, {
    withAuth: true,
  });
// A patient can hold many plans (versions) — this lists all of them, newest
// first, with the headline dashboard numbers per plan already computed.
export const getCarePlans = (patientName, patientType) =>
  http.get(`/v1/care_plans?patient_name=${encodeURIComponent(patientName)}${patientType ? `&patient_type=${encodeURIComponent(patientType)}` : ""}`, {
    withAuth: true,
  });
// Regenerates from a specific existing plan — the new plan becomes active,
// the one passed here stays as read-only history.
export const regenerateCarePlan = (carePlanId, data = {}) => http.post(`/v1/care_plan/${carePlanId}/regenerate`, data, { withAuth: true });

export const wellnessChat = (data) => http.post("/hf-wellness/chat", data, { withAuth: true }).then((res) => res.data);
export const wellnessHistory = ({ session_id } = {}) =>
  http.get(`/hf-wellness/history${session_id ? `?session_id=${encodeURIComponent(session_id)}` : ""}`, { withAuth: true }).then((res) => res.data);
export const wellnessClear = ({ session_id } = {}) => http.post("/hf-wellness/clear", { session_id }, { withAuth: true });
export const wellnessDashboard = () => http.get("/hf-wellness/dashboard", { withAuth: true }).then((res) => res.data);
export const getWellnessProfile = () => http.get("/hf-wellness/profile", { withAuth: true }).then((res) => res.data);
export const updateWellnessProfile = (data) => http.patch("/hf-wellness/profile", data, { withAuth: true }).then((res) => res.data);
export const getWellnessCheckIns = (days = 30) => http.get(`/hf-wellness/check-ins?days=${days}`, { withAuth: true }).then((res) => res.data);
export const getWellnessAlerts = (status) =>
  http.get(`/hf-wellness/alerts${status ? `?status=${status}` : ""}`, { withAuth: true }).then((res) => res.data);
export const wellnessAlertAction = (alertId, data) =>
  http.post(`/hf-wellness/alerts/${alertId}/action`, data, { withAuth: true }).then((res) => res.data);
export const getWellnessVoiceToken = () => http.post("/hf-wellness/voice/live-token", {}, { withAuth: true }).then((res) => res.data);
export const wellnessSpeakStream = (text, signal) => fetchVoiceSpeakStream("/hf-wellness", text, signal);
export const wellnessSpeakBase64 = (text) =>
  http.post("/hf-wellness/voice/speak", { text, as_base64: true }, { withAuth: true }).then((res) => res.data);
// Caregiver read-only view of one facility patient — accepts patient_key
// and/or patient_name (backend OR-matches), but the frontend only ever has
// patient_name available (no patient_key anywhere in this app's data model).
export const getWellnessCaregiverDashboard = (patientName) =>
  http.get(`/hf-wellness/caregiver/dashboard?patient_name=${encodeURIComponent(patientName)}`, { withAuth: true }).then((res) => res.data);

// Wellness Check-in question editor — physician and caregiver share these
// routes; the backend scopes each list to the caller's own patients and
// resolves the patient from patient_name (the same string /retrieve-patient-name
// returns), so no patient_key lookup is needed anywhere on the client.
const CLINICIAN_QUESTIONS = "/hf-wellness/clinician/questions";

export const getClinicianWellnessPatients = () =>
  http.get("/hf-wellness/clinician/patients", { withAuth: true }).then((res) => res.data);
export const getClinicianWellnessQuestions = (patientName) =>
  http.get(`${CLINICIAN_QUESTIONS}?patient_name=${encodeURIComponent(patientName)}`, { withAuth: true }).then((res) => res.data);
export const addClinicianWellnessQuestion = (patientName, body) =>
  http.post(CLINICIAN_QUESTIONS, { ...body, patient_name: patientName }, { withAuth: true }).then((res) => res.data);
export const updateClinicianWellnessQuestion = (patientName, questionId, body) =>
  http.patch(`${CLINICIAN_QUESTIONS}/${questionId}`, { ...body, patient_name: patientName }, { withAuth: true }).then((res) => res.data);
export const deleteClinicianWellnessQuestion = (patientName, questionId) =>
  http
    .delete(`${CLINICIAN_QUESTIONS}/${questionId}?patient_name=${encodeURIComponent(patientName)}`, { withAuth: true })
    .then((res) => res.data);
export const reorderClinicianWellnessQuestions = (patientName, questionIds) =>
  http
    .post(`${CLINICIAN_QUESTIONS}/reorder`, { patient_name: patientName, question_ids: questionIds }, { withAuth: true })
    .then((res) => res.data);
export const resetClinicianWellnessQuestions = (patientName) =>
  http.post(`${CLINICIAN_QUESTIONS}/reset`, { patient_name: patientName }, { withAuth: true }).then((res) => res.data);
export const getWellnessQuestionTemplates = () =>
  http.get("/hf-wellness/question-templates", { withAuth: true }).then((res) => res.data);

// Physician Appointment Booking (patient/POA side) — same {success, data}
// envelope as hf-wellness above, except /clear which returns
// {success, message, session_id} with no `data` key (verified against
// routes.py) — unwrapped to `res.data` for all but that one.
export const appointmentChat = (data) => http.post("/physician-appointment/chat", data, { withAuth: true }).then((res) => res.data);
export const appointmentHistory = ({ session_id } = {}) =>
  http
    .get(`/physician-appointment/history${session_id ? `?session_id=${encodeURIComponent(session_id)}` : ""}`, { withAuth: true })
    .then((res) => res.data);
export const appointmentClear = ({ session_id } = {}) => http.post("/physician-appointment/clear", { session_id }, { withAuth: true });
export const appointmentConfirm = ({ session_id } = {}) =>
  http.post("/physician-appointment/confirm", { session_id }, { withAuth: true }).then((res) => res.data);
export const getAppointmentPhysicians = () => http.get("/physician-appointment/physicians", { withAuth: true }).then((res) => res.data);
export const getAppointmentAvailability = (physicianUserId, { limit, includeEpic = true } = {}) =>
  http
    .get(
      `/physician-appointment/availability?physician_user_id=${encodeURIComponent(physicianUserId)}${
        limit ? `&limit=${limit}` : ""
      }&include_epic=${includeEpic}`,
      { withAuth: true }
    )
    .then((res) => res.data);
export const getAppointmentRequests = (status) =>
  http.get(`/physician-appointment/requests${status ? `?status=${status}` : ""}`, { withAuth: true }).then((res) => res.data);
export const cancelAppointmentRequest = (appointmentId) =>
  http.post(`/physician-appointment/requests/${appointmentId}/cancel`, {}, { withAuth: true }).then((res) => res.data);
export const getAppointmentVoiceToken = () => http.post("/physician-appointment/voice/live-token", {}, { withAuth: true }).then((res) => res.data);
export const appointmentSpeakStream = (text, signal) => fetchVoiceSpeakStream("/physician-appointment", text, signal);
export const appointmentSpeakBase64 = (text) =>
  http.post("/physician-appointment/voice/speak", { text, as_base64: true }, { withAuth: true }).then((res) => res.data);

// Physician Appointment Management (physician side calendar) — same
// {success, data} envelope, verified against physician_routes.py.
export const getPhysicianCalendarAppointments = ({ status, epic_sync_status, from, to } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (epic_sync_status) params.set("epic_sync_status", epic_sync_status);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return http.get(`/physician-appointment/physician/calendar/appointments${qs ? `?${qs}` : ""}`, { withAuth: true }).then((res) => res.data);
};
export const updatePhysicianCalendarAppointment = (appointmentId, payload) =>
  http.patch(`/physician-appointment/physician/calendar/appointments/${appointmentId}`, payload, { withAuth: true }).then((res) => res.data);
export const cancelPhysicianCalendarAppointment = (appointmentId) =>
  http.post(`/physician-appointment/physician/calendar/appointments/${appointmentId}/cancel`, {}, { withAuth: true }).then((res) => res.data);
export const getPhysicianCalendarSettings = () =>
  http.get("/physician-appointment/physician/calendar/settings", { withAuth: true }).then((res) => res.data);
export const updatePhysicianCalendarSettings = (payload) =>
  http.put("/physician-appointment/physician/calendar/settings", payload, { withAuth: true }).then((res) => res.data);
export const getPhysicianCalendarAvailability = (limit) =>
  http.get(`/physician-appointment/physician/calendar/availability${limit ? `?limit=${limit}` : ""}`, { withAuth: true }).then((res) => res.data);
export const getPhysicianCalendarBlocks = ({ from, to } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return http.get(`/physician-appointment/physician/calendar/blocks${qs ? `?${qs}` : ""}`, { withAuth: true }).then((res) => res.data);
};
export const createPhysicianCalendarBlock = (payload) =>
  http.post("/physician-appointment/physician/calendar/blocks", payload, { withAuth: true }).then((res) => res.data);
// No .then((res) => res.data) here — DELETE returns {success, message}, no `data` key (same shape as appointmentClear above).
export const deletePhysicianCalendarBlock = (blockId) =>
  http.delete(`/physician-appointment/physician/calendar/blocks/${blockId}`, { withAuth: true });

// Ambient ("Deepgram") note sessions. Caregiver visit note and physician
// discharge/handoff note share one backend contract; only the URL prefix and
// the note_kind sent at session start differ. One factory, one instance per role.
const makeAmbientNoteApi = (base) => ({
  liveToken: () => http.post(`${base}/voice/live-token`, {}, { withAuth: true }).then((res) => res.data),
  start: (data) => http.post(`${base}/session/start`, data, { withAuth: true }).then((res) => res.data),
  turn: (data) => http.post(`${base}/session/turn`, data, { withAuth: true }).then((res) => res.data),
  stop: (data) => http.post(`${base}/session/stop`, data, { withAuth: true }).then((res) => res.data),
  save: (data) => http.post(`${base}/session/save`, data, { withAuth: true }).then((res) => res.data),
  speakStream: (text, signal) => fetchVoiceSpeakStream(base, text, signal),
  speakBase64: (text) => http.post(`${base}/voice/speak`, { text, as_base64: true }, { withAuth: true }).then((res) => res.data),
});

export const caregiverAmbientNoteApi = makeAmbientNoteApi("/caregiver-ambient-ai");
export const physicianAmbientNoteApi = makeAmbientNoteApi("/physician-ambient-note");

// Back-compat aliases (existing callers). Same functions, via the factory above.
export const ambientAiStart = caregiverAmbientNoteApi.start;
export const ambientAiTurn = caregiverAmbientNoteApi.turn;
export const ambientAiStop = caregiverAmbientNoteApi.stop;
export const ambientAiSave = caregiverAmbientNoteApi.save;
export const getAmbientAiVoiceToken = caregiverAmbientNoteApi.liveToken;

// Physician Ambient AI (passive visit listener) — separate backend module and
// UX shape from caregiver-ambient-ai above: no conversational turns, just
// start -> (live transcript, client-side only) -> stop -> review -> save.
// Same {success, data} envelope, unwrapped to res.data for every route.
export const getPhysicianAmbientVoiceToken = () => http.post("/ambient-ai/voice/live-token", {}, { withAuth: true }).then((res) => res.data);
export const physicianAmbientStart = (data) => http.post("/ambient-ai/session/start", data, { withAuth: true }).then((res) => res.data);
export const physicianAmbientStop = (data) => http.post("/ambient-ai/session/stop", data, { withAuth: true }).then((res) => res.data);
export const physicianAmbientSave = (data) => http.post("/ambient-ai/session/save", data, { withAuth: true }).then((res) => res.data);

// Patient Timeline (physician side) — Metriport encounter history for a matched
// patient. Same {success, data} envelope, verified against physician_match/routes.py.
export const getPatientEncounterTimeline = ({ patient_name, patient_key, status, mine } = {}) => {
  const params = new URLSearchParams();
  if (patient_key) params.set("patient_key", patient_key);
  if (patient_name) params.set("patient_name", patient_name);
  if (status) params.set("status", status);
  if (mine) params.set("mine", "true");
  return http.get(`/physician-match/encounters?${params.toString()}`, { withAuth: true }).then((res) => res.data);
};

// SSE has no Authorization header, so the backend trusts the id in the URL.
export const getNotificationsStreamUrl = (userId) => `${API_BASE}/notifications/stream/${encodeURIComponent(userId)}`;
export const markAllNotificationsRead = () => http.patch("/notifications/read-all", {}, { withAuth: true }).then((res) => res.data);
export const deleteNotificationApi = (msgId) =>
  http.delete(`/notifications/delete?msg_id=${encodeURIComponent(msgId)}`, { withAuth: true }).then((res) => res.data);

// http://127.0.0.1:5000/discharge_plan_agent/edit_template
// {
//     "fields": {
//         "vital": {
//             "question": "Vital Signs: What are the patient's temperature, pulse rate, respiratory rate, weight, blood pressure (right arm and left arm), glucometer usage, and blood sugar values?",
//             "check_prompt": "Are all vital sign values clearly provided with appropriate units and locations?"
//         },
//         "cardiovascular": {
//             "question": "What are the cardiovascular findings including chest pain, heart sounds, peripheral pulses, dizziness, edema (grade and site), neck vein distention, heart rate abnormalities, capillary refill, and other observations?",
//             "check_prompt": "Are cardiovascular assessments complete and clinically descriptive?"
//         },
//         "respiratory": {
//             "question": "What are the respiratory findings including lung sounds, shortness of breath, cough type, sputum characteristics, oxygen use, oxygen saturation, hemoptysis, cyanosis, orthopnea, and other observations?",
//             "check_prompt": "Are respiratory findings clearly documented with relevant qualifiers?"
//         },
//         "neurological": {
//             "question": "What are the neurological findings including seizures, tremors, pupillary reaction (right and left), equality of pupils, and neurological deficits?",
//             "check_prompt": "Are neurological assessments clearly documented and side-specific where applicable?"
//         },
//         "genitourinary_unit": {
//             "question": "What are the genitourinary findings including distention, retention, burning, urinary frequency, hematuria, oliguria, polyuria, catheter type, catheter size, and urine output?",
//             "check_prompt": "Are genitourinary findings complete and specific?"
//         },
//         "sensory": {
//             "question": "Does the patient have any sensory deficits such as hearing impairment, speech impairment (including slurred speech), visual impairment, or legal blindness?",
//             "check_prompt": "Are sensory deficits explicitly identified or ruled out?"
//         },
//         "skin": {
//             "question": "What are the skin findings including temperature, moisture, turgor, and any wound or IV-related care?",
//             "check_prompt": "Are skin assessments complete and descriptive?"
//         },
//         "digestive_nutrition": {
//             "question": "What are the digestive and nutritional findings including last bowel movement, nausea, vomiting, diarrhea, constipation, tube feeding details, NPO status, bowel sounds, abdominal girth, diet, meal preparation, and diet adequacy?",
//             "check_prompt": "Are digestive and nutritional assessments fully completed?"
//         },
//         "musculoskeletal": {
//             "question": "What musculoskeletal findings are present including weakness, endurance, balance, gait, tremors, mobility, pain, grip strength, bedbound or chairbound status, contractures, paralysis, assistive devices, and fall precautions?",
//             "check_prompt": "Are musculoskeletal limitations clearly documented?"
//         },
//         "pain": {
//             "question": "What is the patient's pain assessment including frequency, intensity, location, description, management effectiveness, pain goal, and progress toward the goal?",
//             "check_prompt": "Is pain assessment comprehensive and measurable?"
//         },
//         "infusion": {
//             "question": "What infusion-related assessments or procedures were performed including IV care, infusion details, and equipment used?",
//             "check_prompt": "Are infusion details clearly specified?"
//         },
//         "mental_health_affect": {
//             "question": "What are the patient's mental health and affect findings including behavior, mood, level of consciousness, orientation, and cognitive status?",
//             "check_prompt": "Is mental status assessment complete and consistent?"
//         },
//         "endocrine": {
//             "question": "What endocrine-related observations or interventions were present during this visit?",
//             "check_prompt": "Are endocrine findings clearly noted or ruled out?"
//         },
//         "skilled_intervention_teaching_response": {
//             "question": "What skilled interventions or teaching were provided and how did the patient or caregiver respond?",
//             "check_prompt": "Is patient or caregiver response clearly documented?"
//         },
//         "supervision": {
//             "question": "Was supervision present during this visit, and did the supervising individual follow the patient\u2019s plan of care, maintain open communication with patient representatives or caregivers, demonstrate competency with assigned tasks, comply with infection prevention and control policies, report changes in the patient\u2019s condition, honor patient rights, and provide any additional instruction during the visit? Include supervisor signature if applicable.",
//             "check_prompt": "Are all supervision-related compliance questions clearly answered with Yes or No, and is the supervisor signature documented if required?"
//         },
//         "coordination_plan": {
//             "question": "Who was conferenced with, regarding what issues, any physician contact details, order changes, patient agreement, plan for next visit, and discharge planning?",
//             "check_prompt": "Is care coordination and planning clearly documented?"
//         }
//     }
// }
