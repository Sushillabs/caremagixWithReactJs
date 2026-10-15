import { useEffect } from "react";
import { X, ExternalLink, Download, FileText } from "lucide-react";
import useMyQuery from "../../hooks/useMyQuery";
import { getDashboardDocuments, getDashboardDocumentFileUrl } from "../../api/hospitalApi";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Backs Uploads (caregiver/physician) and Documents (patient) — same list
// shape, scoped server-side per role. See GET /dashboard/documents.
export default function DashboardDocumentsModal({ onClose }) {
  const { data, isLoading, isError } = useMyQuery({ api: getDashboardDocuments, id: "dashboardDocuments", staleTime: 30 * 1000 });
  const documents = data?.documents || [];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white pb-safe shadow-lg sm:max-h-[80vh] sm:w-[640px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2 sm:p-4">
          <h2 className="flex-1 text-base font-semibold text-gray-800 sm:text-sm">Documents</h2>
          {documents.length > 0 && <span className="text-xs text-gray-500 sm:hidden">{documents.length} files</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 sm:h-auto sm:w-auto sm:p-1"
          >
            <X size={16} className="size-5 text-gray-500 sm:size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {isError && <p className="text-sm text-red-600">Couldn't load documents.</p>}

          {!isLoading && !isError && documents.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <FileText size={28} className="text-gray-200" />
              <p className="text-xs text-gray-400">No documents yet.</p>
            </div>
          )}

          {!isLoading && !isError && documents.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <li
                  key={`${doc.document_id}-${doc.file_index}`}
                  className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-gray-800 sm:truncate">{doc.file_name}</p>
                    <p className="text-xs capitalize text-gray-500 sm:truncate">
                      {doc.patient_name}
                      <span className="sm:hidden"> · </span>
                      <span className="hidden sm:inline"> — </span>
                      {doc.document_type}
                      <span className="hidden sm:inline"> — {formatDate(doc.upload_date)}</span>
                    </p>
                    <p className="text-xs text-gray-500 sm:hidden">{formatDate(doc.upload_date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={!doc.available}
                      onClick={() => window.open(getDashboardDocumentFileUrl(doc.open_url), "_blank")}
                      title="Open"
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-700 px-3 text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:rounded-md sm:border-gray-200 sm:bg-transparent sm:p-1.5 sm:text-gray-500 sm:hover:bg-gray-50"
                    >
                      <ExternalLink size={14} />
                      <span className="sm:hidden">Open</span>
                    </button>
                    <button
                      type="button"
                      disabled={!doc.available}
                      onClick={() => window.open(getDashboardDocumentFileUrl(doc.download_url), "_blank")}
                      title="Download"
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 px-3 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:rounded-md sm:border-gray-200 sm:p-1.5 sm:text-gray-500 sm:hover:bg-gray-50"
                    >
                      <Download size={14} />
                      <span className="sm:hidden">Download</span>
                    </button>
                  </div>
                  {!doc.available && <p className="-mt-1 text-xs text-gray-400 sm:hidden">Not available yet</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
