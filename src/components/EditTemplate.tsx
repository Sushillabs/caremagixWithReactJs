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
  // const queryClient = useQueryClient();
  const [fields, setFields] = useState<Record<string, TemplateField>>({});

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

  const handleFieldChange = (key: string, prop: keyof TemplateField, value: string) => {
    setFields((prev) => {
      const current = prev[key] ?? { question: "", check_prompt: "" };
      return {
        ...prev,
        [key]: {
          ...current,
          [prop]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      await mutateAsync({ updated_fields: fields });
      // queryClient.invalidateQueries({ queryKey: ["edit-template"] });
      // onClose();
    } catch (err) {
      console.error("Error saving template", err);
    }
  };

  const isLoading = isPending || (isFetching && !data);

  return (
    <div className=" bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[80vh] flex flex-col relative">
      {/* Header */}
      <div
        className="
        flex 
        justify-between 
        items-center 
        px-6 
        py-4 
        border-b
      "
      >
        <div>
          <h2 className="text-xl font-semibold">Edit Visit Template</h2>

          <p className="text-sm text-gray-500">Update assessment questions and validation prompts</p>
        </div>

        <button
          onClick={onClose}
          className="
            p-2 
            rounded-full 
            hover:bg-gray-100
          "
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div
        className="
        flex-1
        overflow-y-auto
        p-2
        space-y-2
      "
      >
        {isLoading && <Spinner />}

        {isError && <p className="text-red-500 text-center mt-4">{error?.message || "Failed to load template"}</p>}

        {isSuccess &&
          (Object.entries(fields) as [string, TemplateField][]).map(([key, field]) => (
            <div
              key={key}
              className="
                border
                rounded-xl
                p-2
                bg-gray-50
                space-y-1
              "
            >
              {/* Section name */}
              <div
                className="
                text-sm
                font-semibold
                uppercase
                text-blue-600
              "
              >
                {key.replaceAll("_", " ")}
              </div>

              {/* Question */}
              <div>
                <label
                  className="
                  text-sm 
                  font-medium
                  text-gray-700
                "
                >
                  Question
                </label>

                <textarea
                  value={field.question}
                  onChange={(e) => handleFieldChange(key, "question", e.target.value)}
                  rows={3}
                  disabled={isSaving}
                  className="
                    mt-1
                    w-full
                    rounded-lg
                    border
                    p-3
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                    resize-none
                    disabled:opacity-50
                  "
                />
              </div>

              {/* Check Prompt */}
              <div>
                <label
                  className="
                  text-sm 
                  font-medium
                  text-gray-700
                "
                >
                  Check Prompt
                </label>

                <textarea
                  value={field.check_prompt}
                  onChange={(e) => handleFieldChange(key, "check_prompt", e.target.value)}
                  rows={2}
                  disabled={isSaving}
                  className="
                    mt-1
                    w-full
                    rounded-lg
                    border
                    p-3
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                    resize-none
                    disabled:opacity-50
                  "
                />
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div
        className="
        border-t
        px-6
        py-4
        flex
        justify-end
        items-center
        gap-3
        bg-white
      "
      >
        {isSaveError && (
          <p className="text-red-500 text-sm mr-auto">{saveError?.response?.data?.error || saveError?.message || "Failed to save template"}</p>
        )}

        {isSaveSuccess && !isSaveError && <p className="text-green-600 text-sm mr-auto">{saveData?.message || "Template updated successfully."}</p>}

        <button
          onClick={onClose}
          disabled={isSaving}
          className="
            px-5
            py-2
            rounded-lg
            border
            hover:bg-gray-100
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={isLoading || isError || !isSuccess || isSaving}
          className="
            flex
            items-center
            gap-2
            px-5
            py-2
            rounded-lg
            bg-blue-600
            text-white
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </div>
  );
};

export default EditTemplate;
