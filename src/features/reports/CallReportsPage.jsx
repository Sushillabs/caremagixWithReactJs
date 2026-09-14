import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { getCallReport, generateCallReport } from "../../api/hospitalApi";

// Excel generation is entirely client-side — /generate_report only returns
// JSON call records, no file. Same approach as the existing (unwired)
// components/CallReport.tsx: build the workbook in the browser with the
// xlsx package and trigger a save.
export default function CallReportsPage() {
  const { search } = useOutletContext() || {};
  const [downloadingName, setDownloadingName] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["call-reports"],
    queryFn: getCallReport,
  });

  const { mutateAsync } = useMutation({ mutationFn: generateCallReport });

  const filteredPatients = useMemo(() => {
    const patients = data?.patients || [];
    const q = (search || "").trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.patient_name?.toLowerCase().includes(q));
  }, [data, search]);

  const handleDownload = async (patient) => {
    setDownloadError(null);
    setDownloadingName(patient.patient_name);
    try {
      const res = await mutateAsync({ patient_name: patient.patient_name, to_numbers: patient.to_numbers });
      const records = res?.[patient.patient_name] || [];
      if (records.length === 0) {
        setDownloadError(`No call records found for ${patient.patient_name}.`);
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(records);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${patient.patient_name}_report.xlsx`);
    } catch (err) {
      setDownloadError(err?.response?.data?.error || err?.message || `Failed to generate report for ${patient.patient_name}.`);
    } finally {
      setDownloadingName(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-800">Call Reports</h2>
      </div>

      {downloadError && <p className="border-b border-gray-100 px-4 py-2 text-xs text-red-600">{downloadError}</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-3 font-medium">SL No</th>
            <th className="px-4 py-3 font-medium">Patient name</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          )}
          {isError && !isLoading && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-red-600">
                {error?.response?.data?.error || "Failed to load call reports."}
              </td>
            </tr>
          )}
          {!isLoading && !isError && filteredPatients.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                No patients found
              </td>
            </tr>
          )}
          {filteredPatients.map((p, idx) => (
            <tr key={p.patient_name} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
              <td className="px-4 py-3 text-gray-700">{p.patient_name}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDownload(p)}
                  disabled={downloadingName === p.patient_name}
                  className="inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={14} />
                  {downloadingName === p.patient_name ? "Generating..." : "Download"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
