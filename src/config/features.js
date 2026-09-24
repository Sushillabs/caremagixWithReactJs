export const ALL_ROLES = ["caregiver", "physician", "patient"];
// const CLINICIAN_ROLES = ["caregiver", "physician"];

export const FEATURE_ROLES = {
  addPatient: ["caregiver"],
  notes: ["caregiver", "physician"],
  documents: ALL_ROLES,
  plan: ["caregiver", "patient"],
  forms: ["caregiver"],
  upload: ["caregiver", "patient"],
  mmta: ["caregiver"],
  registerCall: ["caregiver"],
  // medicationAlerts: ["caregiver", "physician"],
  medicationAlerts: ["caregiver"],
  medication: ["caregiver", "patient"],
  patientJourney: ["caregiver"],
  createCarePlan: ["caregiver"],
  wellnessCheckIn: ["patient"],
  bookAppointment: ["patient"],
  wellnessCheckInReport: ["caregiver"],
  wellnessQuestionEditor: ["physician"],
  createProgressNotes: ["physician"],
  timeline: ["physician"],
  ambientVisitNotes: ["physician"],
  sendMessage: ["caregiver", "physician"],
};

export const canUseFeature = (role, key) => (FEATURE_ROLES[key] || ALL_ROLES).includes(role);
