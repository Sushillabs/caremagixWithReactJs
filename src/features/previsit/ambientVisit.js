const STORAGE_KEY = "ambient_visits";
// BE keeps an Ambient session in Redis for about 4 hours.
const MAX_AGE_MS = 4 * 60 * 60 * 1000;

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function rememberAmbientVisit(userId, patientKey, sessionId) {
  if (!userId || !patientKey || !sessionId) return;
  const all = readAll();
  all[`${userId}:${patientKey}`] = { session_id: sessionId, saved_at: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage full or blocked: exam plan still works with the latest session on BE
  }
}

export function getAmbientVisit(userId, patientKey) {
  const visit = readAll()[`${userId}:${patientKey}`];
  if (!visit || Date.now() - visit.saved_at > MAX_AGE_MS) return null;
  return visit;
}
