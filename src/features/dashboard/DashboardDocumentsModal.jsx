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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="flex max-h-[80vh] w-[640px] flex-col rounded-2xl bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800">Documents</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
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
                <li key={`${doc.document_id}-${doc.file_index}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{doc.file_name}</p>
                    <p className="truncate text-xs capitalize text-gray-500">
                      {doc.patient_name} — {doc.document_type} — {formatDate(doc.upload_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={!doc.available}
                      onClick={() => window.open(getDashboardDocumentFileUrl(doc.open_url), "_blank")}
                      title="Open"
                      className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={!doc.available}
                      onClick={() => window.open(getDashboardDocumentFileUrl(doc.download_url), "_blank")}
                      title="Download"
                      className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
