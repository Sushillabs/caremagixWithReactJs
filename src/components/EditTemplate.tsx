import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { edit_visit_template, update_visit_template } from "../api/hospitalApi.js";
import useMyQuery from "../hooks/useMyQuery.js";
import useMyMutation from "../hooks/useMyMutation.js";
import { Spinner } from "./Spiner.jsx";

interface EditTemplateProps {
  onClose: () => void;
}

interface TemplateField {
  question: string;
  check_prompt: string;
}

interface EditTemplateResponse {
  fields: Record<string, TemplateField>;
}

const EditTemplate = ({ onClose }: EditTemplateProps) => {
  const [fields, setFields] = useState<Record<string, TemplateField>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, error, isSuccess, isError, isPending, isFetching } = useMyQuery<EditTemplateResponse>({
    api: edit_visit_template,
    id: "edit-template",
    toastId: "get-template",
    enabled: true,
  });

  const {
    mutateAsync,
    isPending: isSaving,
    isError: isSaveError,
    isSuccess: isSaveSuccess,
    error: saveError,
    data: saveData,
  } = useMyMutation({
    api: update_visit_template,
    toastId: "save-template",
  });

  useEffect(() => {
    if (data?.fields) {
      setFields(data.fields);
    }
  }, [data]);

  const keys = Object.keys(fields);
  const currentKey = keys[currentIndex];
  const currentField = fields[currentKey] ?? { question: "", check_prompt: "" };

  const handleFieldChange = (prop: keyof TemplateField, value: string) => {
    setFields((prev) => ({
      ...prev,
      [currentKey]: {
        ...(prev[currentKey] ?? { question: "", check_prompt: "" }),
        [prop]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // await mutateAsync({ updated_fields: fields });
    } catch (err) {
      console.error("Error saving template", err);
    }
  };

  const isLoading = isPending || (isFetching && !data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl h-[80vh] flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-black">Edit Visit Notes Template</h2>
        <button onClick={onClose} className="p-2 rounded-full text-black hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && <Spinner />}

        {isError && <p className="text-red-600 text-center mt-4">{error?.message || "Failed to load template"}</p>}

        {isSuccess && keys.length > 0 && (
          <>
            <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-emerald-50 p-3 mb-4 text-xs sm:text-sm">
              {keys.map((key, idx) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`whitespace-nowrap hover:cursor-pointer ${
                    idx === currentIndex ? "font-semibold text-emerald-800 underline" : "text-emerald-600 hover:text-emerald-800"
                  }`}
                >
                  {idx + 1}. {key.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Question</label>
              <textarea
                value={currentField.question}
                onChange={(e) => handleFieldChange("question", e.target.value)}
                rows={3}
                disabled={isSaving}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none disabled:opacity-50"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Check Prompt</label>
              <textarea
                value={currentField.check_prompt}
                onChange={(e) => handleFieldChange("check_prompt", e.target.value)}
                rows={2}
                disabled={isSaving}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none disabled:opacity-50"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 flex justify-end items-center gap-3 bg-white">
        {isSaveError && (
          <p className="text-red-600 text-sm mr-auto">{saveError?.response?.data?.error || saveError?.message || "Failed to save template"}</p>
        )}

        {isSaveSuccess && !isSaveError && <p className="text-emerald-700 text-sm mr-auto">{saveData?.message || "Template updated successfully."}</p>}

        <button
          onClick={handleSave}
          disabled={isLoading || isError || !isSuccess || isSaving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
    </div>
  );
};

export default EditTemplate;
