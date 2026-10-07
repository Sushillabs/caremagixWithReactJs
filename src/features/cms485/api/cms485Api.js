import http from "../../../api/httpClient";

export const startCms485Fill = (data) => http.post("/v1/get_filled_485", data, { withAuth: true });

export const getCms485Progress = (jobId) => http.get(`/v1/form_485/progress/${jobId}`);
