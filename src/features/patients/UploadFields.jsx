import { useRef } from "react";

export default function UploadFields({
  config,
  selectedPlan,
  onSelectPlan,
  file,
  onFileChange,
  fileError,
  saveDocument,
  onToggleSaveDocument,
  disabled,
}) {
  const fileInputRef = useRef(null);

  const isAllowedExt = (fileName) => config.allowedExt.some((ext) => fileName.toLowerCase().endsWith(ext));

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0] || null;
    onFileChange(picked, picked && !isAllowedExt(picked.name) ? config.fileErrorMsg : null);
  };

  return (
    <>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600">Select Plan</label>
        <div className="flex gap-1">
          {config.planOptions.map((plan) => {
            const checked = selectedPlan === plan;
            return (
              <label
                key={plan}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-1 py-1.5 text-xs ${
                  checked ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan}
                  checked={checked}
                  onChange={() => onSelectPlan(plan)}
                  className="h-3.5 w-3.5 accent-emerald-600"
                />
                {plan}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600">Select Document</label>
        <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5">
          <span className="truncate text-xs text-gray-500">{file?.name || "no file chosen"}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Choose file
          </button>
          <input ref={fileInputRef} type="file" accept={config.accept} className="hidden" onChange={handleFileChange} />
        </div>
        {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={saveDocument}
          onChange={(e) => onToggleSaveDocument(e.target.checked)}
          className="h-3.5 w-3.5 accent-emerald-600"
        />
        You want to save the document
      </label>
    </>
  );
}
