import http from "../../api/httpClient";

export const toPatientKey = (name) => (name || "").toLowerCase().trim().split(/\s+/).join("_");

export const startPrevisit = (data) => http.post("/v1/previsit/runs", data, { withAuth: true });

export const getPrevisitRun = (runId) => http.get(`/v1/previsit/runs/${runId}`, { withAuth: true });

export const getLatestPrevisit = (patientKey) =>
  http.get(`/v1/previsit/patients/${encodeURIComponent(patientKey)}/latest`, { withAuth: true });

export const downloadPrevisitPdf = (runId) =>
  http.get(`/v1/previsit/runs/${runId}/pdf`, { withAuth: true, responseType: "blob" });

export const startExamPlan = (data) => http.post("/v1/diagnosis-report/runs", data, { withAuth: true });

export const getExamPlanRun = (runId) => http.get(`/v1/diagnosis-report/runs/${runId}`, { withAuth: true });

// Assumed routes until BE confirms the save and PDF APIs.
export const saveExamPlan = (runId, data) => http.put(`/v1/diagnosis-report/runs/${runId}`, data, { withAuth: true });

export const downloadExamPlanPdf = (runId) =>
  http.get(`/v1/diagnosis-report/runs/${runId}/pdf`, { withAuth: true, responseType: "blob" });

export const getLatestExamPlan = (patientKey) =>
  http.get(`/v1/diagnosis-report/patients/${encodeURIComponent(patientKey)}/latest`, { withAuth: true });
