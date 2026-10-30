import useMyQuery from "./useMyQuery";
import { getPatientMeta } from "../api/hospitalApi";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

const toUsDate = (value) => {
  const m = ISO_DATE.exec(value || "");
  return m ? `${m[2]}/${m[3]}/${m[1]}` : value || null;
};

const ageFromDob = (value) => {
  const m = ISO_DATE.exec(value || "");
  if (!m) return null;
  const today = new Date();
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age >= 0 ? age : null;
};

const firstValid = (rows, pick) => {
  for (const row of rows) {
    const value = pick(row);
    if (value != null && value !== "") return value;
  }
  return null;
};

export default function usePatientMeta(patientName) {
  const name = (patientName || "").trim();
  const { data } = useMyQuery({
    api: () => getPatientMeta(name),
    id: ["patientMeta", name],
    enabled: Boolean(name),
  });

  // Backend matches patient_name with LIKE %name%, so keep exact matches only.
  const rows = (data?.items || []).filter((r) => (r.patient_name || "").trim().toLowerCase() === name.toLowerCase());
  const dob = data?.dob || firstValid(rows, (r) => r.date_of_birth);
  const gender = (data?.gender || firstValid(rows, (r) => r.gender) || "").trim() || null;
  const age = data?.age ?? ageFromDob(dob) ?? firstValid(rows, (r) => r.age);

  return {
    dob: toUsDate(dob),
    age,
    gender,
  };
}
