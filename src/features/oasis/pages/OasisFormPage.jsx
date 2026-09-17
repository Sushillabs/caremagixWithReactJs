import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, Download, MoreVertical } from "lucide-react";
import OasisField from "../engine/fields";
import SectionNavigator from "../engine/SectionNavigator";
import { filterVisibleFields } from "../engine/skipLogic";
import { useOasisSaveLoad } from "../engine/saveLoad";
import { buildExportData, exportFileName, collectPayload } from "../engine/payload";
import { applySkipMarks } from "../engine/skipLogic";
import { requestOasisXml, fetchOasisXmlBlob } from "../api/oasisApi";
import { indexErrors, classifyApiError } from "../engine/validation";
import { ValidationProvider } from "../engine/ValidationContext";
import ValidationErrorPanel from "../engine/ValidationErrorPanel";
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

  const fileInputRef = useRef(null);
  const [validation, setValidation] = useState({ errors: [], headline: "", topLevel: null });
  const [patientDetails, setPatientDetails] = useState(null);
  const [exportingXml, setExportingXml] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { status, saveToServer, loadFromServer, clearOnServer } = useOasisSaveLoad({
    formKey: schema.formKey,
    patientId,
    patientName,
    schema,
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
      .then(({ values, patientDetails: details }) => {
        if (cancelled) return;
        if (values) methods.reset(values);
        setPatientDetails(details);
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
  const validationIndex = useMemo(() => indexErrors(schema, validation.errors), [schema, validation.errors]);

  const handleSave = methods.handleSubmit(async (values) => {
    try {
      await saveToServer(values);
      toast.success("OASIS form saved.");
    } catch (err) {
      toast.error(err.message || "Save failed — please retry.");
    }
  });

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(buildExportData(schema, methods.getValues()), null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, exportFileName(schema));
  };

  const handleExportXml = async () => {
    if (!patientName) return toast.error("Patient name is required to export XML.");
    if (!patientId) return toast.error("Patient id is required to export XML.");

    setExportingXml(true);
    dismissValidation();
    try {
      const res = await requestOasisXml({
        patient_name: patientName,
        patient_id: patientId,
        form_name: schema.formKey,
        mapped_data: applySkipMarks(schema, collectPayload(schema, methods.getValues())),
        patient_details: patientDetails ?? {},
      });
      if (!res?.xml_url) throw new Error("No xml_url in response");

      const blob = await fetchOasisXmlBlob(res.xml_url);
      downloadBlob(blob, `${res.form_name || schema.formKey}_${res.patient_name || patientName}.xml`);
      toast.success("CMS XML exported successfully.");
    } catch (err) {
      const classified = classifyApiError(err);
      if (classified.kind === "unknown") toast.error(`XML export failed: ${classified.message}`);
      else setValidation(classified);
    } finally {
      setExportingXml(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      methods.reset(imported);
      await saveToServer(imported);
      toast.success("Data imported successfully.");
    } catch (err) {
      toast.error(
        err instanceof SyntaxError
          ? "Error reading JSON file. Please check the file format."
          : err.message || "Import failed."
      );
    }
  };

  const dismissValidation = () => setValidation({ errors: [], headline: "", topLevel: null });

  const jumpToField = (fieldId, sectionId) => {
    if (sectionId) setActiveSectionId(sectionId);
    setTimeout(() => {
      const el = document.getElementsByName(fieldId)[0] ?? document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus?.();
      }
    }, 150);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all data? This cannot be undone.")) return;
    methods.reset({});
    dismissValidation();
    try {
      await clearOnServer();
      toast.success("Cleared.");
    } catch (err) {
      toast.error(err.message || "Clear failed on the server.");
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 text-sm text-red-600">
        Missing patient_id in the URL — open this form from the OASIS patient list, not directly.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex shrink-0 items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">{schema.title ?? schema.formKey}</p>
          <p className="truncate text-[11px] text-gray-400">
            {patientName ? `${patientName} · ` : ""}
            {schema.formKey}
          </p>
        </div>
        {isReview && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            Review
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {status === "saving" && <span className="text-xs text-gray-400">Saving…</span>}
          {status === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
          {status === "error" && <span className="text-xs text-red-600">Save failed</span>}
          <button
            type="button"
            onClick={handleExportXml}
            disabled={exportingXml}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={13} />
            {exportingXml ? "Exporting…" : "Export XML"}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); handleExportJson(); }}
                    className="block w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); fileInputRef.current?.click(); }}
                    className="block w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Import JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); handleClearAll(); }}
                    className="block w-full border-t border-gray-100 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Save
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50">
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
            <SectionNavigator
              sections={schema.sections}
              activeSectionId={activeSection.id}
              onSelect={setActiveSectionId}
              answers={answers}
              sectionsWithErrors={validationIndex.sectionIds}
            />
          </div>
          <div className="p-4">
          <ValidationErrorPanel
            schema={schema}
            errors={validation.errors}
            headline={validation.headline}
            topLevel={validation.topLevel}
            onDismiss={dismissValidation}
            onJump={jumpToField}
          />
          <FormProvider {...methods}>
            <ValidationProvider value={validationIndex}>
              <form onSubmit={(e) => e.preventDefault()}>
                {schema.sections.map((section) => (
                  <div key={section.id} hidden={section.id !== activeSection.id} className="flex flex-col gap-3">
                    {filterVisibleFields(section.items, answers).map((field) => (
                      <OasisField key={field.fieldId ?? field.itemCode ?? field.label} field={field} />
                    ))}
                  </div>
                ))}
              </form>
            </ValidationProvider>
          </FormProvider>
          </div>
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
