import { useSelector } from "react-redux";
import useProgress from "../../hooks/useProgress";

const TYPE_LABELS = {
  "ocr-job": "Scan PDF",
  "eFax-job": "eFax",
  "care-plan-job": "Care Plan",
};

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  INPROGRESS: "bg-blue-50 text-blue-700",
};

export default function JobsPage() {
  const { eFaxJobs, ocrJobs, carePlanJobs } = useSelector((state) => state.jobsId);
  const finalJobs = useSelector((state) => state.finalJobStatus.finalJobs);

  const jobs = [
    ...(Array.isArray(ocrJobs) ? ocrJobs.map((j) => ({ ...j, type: "ocr-job" })) : []),
    ...(Array.isArray(eFaxJobs) ? eFaxJobs.map((j) => ({ ...j, type: "eFax-job" })) : []),
    ...(Array.isArray(carePlanJobs) ? carePlanJobs.map((j) => ({ ...j, type: "care-plan-job" })) : []),
  ];

  const queries = useProgress(jobs);

  const rows = jobs
    .map((job, i) => {
      const query = queries[i];
      const live = query?.data;
      const finalRecord = finalJobs.find((f) => f.jobId === job.job_id);
      const status = finalRecord?.status || live?.status || (query?.isLoading ? "LOADING" : "INPROGRESS");
      const progress = status === "COMPLETED" ? 100 : status === "FAILED" ? 0 : live?.progress ?? 0;

      return {
        jobId: job.job_id,
        type: TYPE_LABELS[job.type] || job.type,
        patientName: job.patient_name || job.job_id || "—",
        fileName: job.file_name || "—",
        status,
        progress,
        message: finalRecord?.message || live?.message || (query?.isLoading ? "Loading..." : "Waiting..."),
      };
    })
    .reverse();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-4">
        <h1 className="text-sm font-semibold text-gray-800">Jobs</h1>
        <p className="text-xs text-gray-500">Uploads, scans, eFax, and care plan generation running in this session.</p>
      </div>

      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-gray-400">No jobs yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Patient</th>
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Progress</th>
                <th className="px-4 py-2 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.jobId} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2 text-gray-700">{row.type}</td>
                  <td className="max-w-[180px] truncate px-4 py-2 text-gray-700">{row.patientName}</td>
                  <td className="max-w-[180px] truncate px-4 py-2 text-gray-700">{row.fileName}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{row.progress}%</td>
                  <td className="max-w-[280px] truncate px-4 py-2 text-gray-500">{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
