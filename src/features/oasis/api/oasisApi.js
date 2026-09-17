import http from "../../../api/httpClient";

// Same two endpoints the legacy jQuery engine hits (aerial-view doc §A) — payload/params
// shape kept exactly as legacy sends it, no client-side mapping (§E: mapToCMS is dead
// code there, backend already owns that translation).
export const saveOasisForm = (data) => http.post("/save_oasis_json", data, { withAuth: true });

export const getOasisForm = (params) => http.get("/get_oasis_json", { params, withAuth: true });

export const listOasisPatients = () => http.get("/get_oasis_json", { withAuth: true });

export const clearOasisForm = (data) => http.post("/clear_oasis_json", data, { withAuth: true });

export const requestOasisXml = (data) => http.post("/download_oasis_xml", data, { withAuth: true });

// xml_url is absolute and sits outside the API base, so it bypasses the axios client.
export async function fetchOasisXmlBlob(xmlUrl) {
  const res = await fetch(xmlUrl, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error(`Could not download the generated XML (${res.status}).`);
  return res.blob();
}
