import http from "../../../api/httpClient";

// Same two endpoints the legacy jQuery engine hits (aerial-view doc §A) — payload/params
// shape kept exactly as legacy sends it, no client-side mapping (§E: mapToCMS is dead
// code there, backend already owns that translation).
export const saveOasisForm = (data) => http.post("/save_oasis_json", data, { withAuth: true });

export const getOasisForm = (params) => http.get("/get_oasis_json", { params, withAuth: true });
