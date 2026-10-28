import { X, AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ title = "Delete", message, pending, error, confirmLabel = "Delete", onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[360px] rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-red-700">{title}</h2>
          <button type="button" onClick={onCancel} className="rounded-full p-1 hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p>{message}</p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="flex-1 rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {onConfirm ? "Cancel" : "OK"}
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Deleting..." : confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
