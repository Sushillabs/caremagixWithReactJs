import { useForm } from "react-hook-form";
import { useState } from "react";
import { X } from "lucide-react";
import { uploadPlan } from "../api/hospitalApi";

export default function UploadPatientPlan({ onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (!data.file || data.file.length === 0) {
        throw new Error("Please select a file to upload.");
      }

      const file = data.file[0];
      const fileType = file.name.split('.').pop().toLowerCase();

      const formData = new FormData();
      formData.append("file_type", fileType);
      formData.append("patient_name", data.patient_name);
      formData.append("patient_type", data.plan);
      formData.append("patient_doc", data.keep_doc);
      formData.append("file", file);
      formData.append("confirm", "false");

      console.log("Submitting FormData:", data);

      const res = await uploadPlan(formData);
      console.log("Upload Plan API response:", res);
      if (res.message === "File uploaded successfully.") {
        onClose(); // close modal on success
      }

      reset(); // reset form after successful submission
    } catch (err) {
      console.error("Error uploading plan:", err.message);

    } finally {
      setLoading(false);
    }
  };


  return (
    // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-xl font-semibold mb-4">
        Upload Patient&apos;s Plan
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Name
          </label>
          <input
            type="text"
            {...register("patient_name", { required: "Patient name is required" })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.patient_name && (
            <p className="text-red-500 text-sm">{errors.patient_name.message}</p>
          )}
        </div>

        {/* Select Plan */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Plan</label>
          <select
            {...register("plan", { required: "Please select a plan" })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Choose</option>
            <option value="Discharged">Discharge Plan</option>
            <option value="Nursing-Care">Nursing Plan</option>
            <option value="Medical Adherence">Medical Adherence</option>
          </select>
          {errors.plan && (
            <p className="text-red-500 text-sm">{errors.plan.message}</p>
          )}
        </div>

        {/* Keep Doc */}
        <div>
          <label className="block text-sm font-medium mb-1">Keep Doc</label>
          <select
            {...register("keep_doc", { required: "Please choose an option" })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Choose</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.keep_doc && (
            <p className="text-red-500 text-sm">{errors.keep_doc.message}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload File</label>
          <input
            type="file"
            accept=".pdf,.xml,.docx"
            {...register("file", { required: "File is required" })}
            className="w-full border rounded-lg px-3 py-2 bg-white"
          />
          {errors.file && (
            <p className="text-red-500 text-sm">{errors.file.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
    // </div>
  );
}
