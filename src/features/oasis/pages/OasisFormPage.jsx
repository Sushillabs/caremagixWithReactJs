import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import OasisField from "../engine/fields";
import SectionNavigator from "../engine/SectionNavigator";
import { filterVisibleFields } from "../engine/skipLogic";
import { useOasisSaveLoad } from "../engine/saveLoad";
import { OasisModeProvider, useOasisMode } from "../engine/ModeContext";
import fuSchema from "../schemas/fu.schema";

// Phase 1 Step 2: the real Form Shell, proven end-to-end on FU. formType -> schema
// map is intentionally tiny right now (Phase 3/4 add SOC/ROC/DC/DAH/TRN here, nothing
// else in this file changes). Patient identity comes from the URL, same contract
// legacy used (?patient_id=&patient_name=&mode=fill|review) — Phase 2's wizard/landing
// grid is what will actually construct that URL; this page doesn't care who does.
const FORM_SCHEMAS = { FU: fuSchema };

function OasisFormShell({ schema }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isReview } = useOasisMode();

  const patientId = searchParams.get("patient_id") || "";
  const patientName = searchParams.get("patient_name") || "";

  const methods = useForm({ defaultValues: {} });
  const firstSectionWithFields = schema.sections.find((s) => s.items.length > 0) ?? schema.sections[0];
  const [activeSectionId, setActiveSectionId] = useState(firstSectionWithFields?.id);
  const [loading, setLoading] = useState(true);

  const { status, saveToServer, loadFromServer } = useOasisSaveLoad({
    formKey: schema.formKey,
    patientId,
    patientName,
  });

  // Always fetch on open (normalized across all 6 forms, aerial-view doc §B) — no
  // skip-fetch-in-fill-mode branch like legacy's SOC/DAH/TRN had.
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadFromServer()
      .then((data) => {
        if (!cancelled && data) methods.reset(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load saved OASIS data — starting blank.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, schema.formKey]);

  const answers = methods.watch();
  const activeSection = schema.sections.find((s) => s.id === activeSectionId) ?? schema.sections[0];

  const handleSave = methods.handleSubmit(async (values) => {
    try {
      await saveToServer(values);
      toast.success("OASIS form saved.");
    } catch (err) {
      toast.error(err.message || "Save failed — please retry.");
    }
  });

  if (!patientId) {
    return (
      <div className="p-6 text-sm text-red-600">
        Missing patient_id in the URL — open this form from the OASIS patient list, not directly.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="font-semibold text-gray-800">
          {schema.formKey}
          {patientName ? ` — ${patientName}` : ""}
        </h3>
        {isReview && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Review
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {status === "saving" && <span className="text-xs text-gray-400">Saving…</span>}
          {status === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
          {status === "error" && <span className="text-xs text-red-600">Save failed</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <SectionNavigator
            sections={schema.sections}
            activeSectionId={activeSection.id}
            onSelect={setActiveSectionId}
            answers={answers}
          />
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              {schema.sections.map((section) => (
                <div key={section.id} hidden={section.id !== activeSection.id} className="divide-y">
                  {filterVisibleFields(section.items, answers).map((field) => (
                    <OasisField key={field.fieldId ?? field.itemCode ?? field.label} field={field} />
                  ))}
                </div>
              ))}
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  );
}

export default function OasisFormPage() {
  const { formType } = useParams();
  const resolvedType = (formType || "FU").toUpperCase();
  const schema = FORM_SCHEMAS[resolvedType];

  if (!schema) {
    return (
      <div className="p-6 text-sm text-red-600">
        Unknown or not-yet-built OASIS form type "{resolvedType}".
      </div>
    );
  }

  return (
    <OasisModeProvider>
      <OasisFormShell schema={schema} />
    </OasisModeProvider>
  );
}
