import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { editNoteTemplate, updateNoteTemplate } from "../api/hospitalApi.js";
import useMyQuery from "../hooks/useMyQuery.js";
import useMyMutation from "../hooks/useMyMutation.js";
import { Spinner } from "./Spiner.jsx";

interface EditTemplateProps {
  onClose: () => void;
  title?: string;
  // undefined -> caregiver visit template (backend picks by role); "discharge"/"handoff" -> physician
  noteKind?: "discharge" | "handoff";
}

interface TemplateField {
  question: string;
  check_prompt: string;
}

interface TemplateSection extends TemplateField {
  key: string;
  locked?: boolean;
}

interface EditTemplateResponse {
  fields: Record<string, TemplateField>;
}

// trim + spaces -> underscores; no other normalisation
const normalizeKey = (k: string) => k.trim().replace(/\s+/g, "_");

const SIGNATURE_KEY = "clinician_signature";

const SIGNATURE_SECTION: TemplateSection = {
  key: SIGNATURE_KEY,
  question: "Please state the clinician's full name and credentials to sign this visit note.",
  check_prompt: "Is the clinician's full name and credentials documented? If not provided, ask the user.",
  locked: true,
};

const EditTemplate = ({ onClose, title = "Edit Visit Notes Template", noteKind }: EditTemplateProps) => {
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyError, setKeyError] = useState<string | null>(null);
  const canAddSection = !noteKind;
  const queryClient = useQueryClient();

  const { data, error, isSuccess, isError, isPending, isFetching } = useMyQuery<EditTemplateResponse>({
    api: editNoteTemplate(noteKind),
    id: ["edit-template", noteKind ?? "visit"],
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
    api: updateNoteTemplate,
    toastId: "save-template",
  });

  useEffect(() => {
    if (!data?.fields) return;

    let list: TemplateSection[] = Object.entries(data.fields).map(([key, value]) => ({
      key,
      question: value?.question ?? "",
      check_prompt: value?.check_prompt ?? "",
    }));

    if (canAddSection) {
      const saved = list.find((s) => s.key === SIGNATURE_KEY);
      const signature = saved ? { ...saved, locked: true } : SIGNATURE_SECTION;
      list = [...list.filter((s) => s.key !== SIGNATURE_KEY), signature];
    }

    setSections(list);
  }, [data, canAddSection]);

  const addSection = () => {
    const signatureIndex = sections.findIndex((s) => s.locked);
    const insertAt = signatureIndex === -1 ? sections.length : signatureIndex;

    const next = [...sections];
    next.splice(insertAt, 0, { key: "", question: "", check_prompt: "" });

    setSections(next);
    setCurrentIndex(insertAt);
  };

  const current = sections[currentIndex] ?? { key: "", question: "", check_prompt: "" };

  const updateCurrent = (prop: keyof TemplateSection, value: string) => {
    setKeyError(null);
    setSections((prev) => prev.map((s, i) => (i === currentIndex ? { ...s, [prop]: value } : s)));
  };

  const handleSave = async () => {
    const updated_fields: Record<string, TemplateField> = {};
    const seen = new Set<string>();
    for (const [i, s] of sections.entries()) {
      const key = normalizeKey(s.key);
      if (!key) {
        setCurrentIndex(i);
        setKeyError("Section key cannot be empty.");
        return;
      }
      if (seen.has(key)) {
        setCurrentIndex(i);
        setKeyError(`Duplicate section key: "${key}".`);
        return;
      }
      if (!s.question.trim()) {
        setCurrentIndex(i);
        setKeyError(`Question cannot be empty in "${key.replaceAll("_", " ")}".`);
        return;
      }
      if (!s.check_prompt.trim()) {
        setCurrentIndex(i);
        setKeyError(`Check Prompt cannot be empty in "${key.replaceAll("_", " ")}".`);
        return;
      }
      seen.add(key);
      updated_fields[key] = { question: s.question, check_prompt: s.check_prompt };
    }
    setKeyError(null);
    try {
      await mutateAsync({ updated_fields, note_kind: noteKind });
      queryClient.invalidateQueries({ queryKey: ["edit-template", noteKind ?? "visit"] });
    } catch (err) {
      console.error("Error saving template", err);
    }
  };

  const isLoading = isPending || (isFetching && !data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4">
      <div className="bg-white shadow-lg w-full max-w-3xl h-dvh pb-safe flex flex-col relative sm:h-[80vh] sm:rounded-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-my-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-black hover:bg-gray-200 sm:m-0 sm:h-auto sm:w-auto sm:p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <Spinner />}

          {isError && <p className="text-red-600 text-center mt-4">{error?.message || "Failed to load template"}</p>}

          {isSuccess && sections.length > 0 && (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-emerald-50 p-3 mb-4 text-xs sm:text-sm">
                {sections.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`whitespace-nowrap hover:cursor-pointer ${
                      idx === currentIndex ? "font-semibold text-emerald-800 underline" : "text-emerald-600 hover:text-emerald-800"
                    }`}
                  >
                    {idx + 1}. {s.key.trim() ? s.key.replaceAll("_", " ") : "(unnamed)"}
                  </button>
                ))}
                {canAddSection && (
                  <button
                    type="button"
                    onClick={addSection}
                    disabled={isSaving}
                    className="whitespace-nowrap font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                  >
                    + Add Section
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Section Key</label>
                <input
                  type="text"
                  value={current.key}
                  onChange={(e) => updateCurrent("key", e.target.value)}
                  disabled={isSaving || current.locked}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Saved as <span className="font-mono">{normalizeKey(current.key) || "—"}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Question</label>
                <textarea
                  value={current.question}
                  onChange={(e) => updateCurrent("question", e.target.value)}
                  rows={3}
                  disabled={isSaving}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none disabled:opacity-50"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Check Prompt</label>
                <textarea
                  value={current.check_prompt}
                  onChange={(e) => updateCurrent("check_prompt", e.target.value)}
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
          {keyError && <p className="text-red-600 text-sm mr-auto">{keyError}</p>}

          {!keyError && isSaveError && (
            <p className="text-red-600 text-sm mr-auto">{saveError?.response?.data?.error || saveError?.message || "Failed to save template"}</p>
          )}

          {!keyError && isSaveSuccess && !isSaveError && (
            <p className="text-emerald-700 text-sm mr-auto">{saveData?.message || "Template updated successfully."}</p>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading || isError || !isSuccess || isSaving || sections.length === 0}
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
