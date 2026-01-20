import { useForm } from "react-hook-form";
import { useState } from "react";
import { X } from "lucide-react";
import { uploadEFaxConfig } from "../api/hospitalApi";
import useMyMutation from "../hooks/useMyMutation";

export default function EFaxConfigForm({ onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // const [loading, setLoading] = useState(false);
  const { data, error: efaxError, isError: isEfaxError, isPending, isSuccess, mutate, mutateAsync } = useMyMutation({ api: uploadEFaxConfig, toastId: 'uploadEFaxConfig' });
  // console.log('efax config useMutation:', { data, efaxError, isEfaxError, isPending });
  const onSubmit = async (data) => {
    await mutateAsync(data);
    if(isSuccess){
      reset();
      setTimeout(() => {
        onClose();
      }, 4000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-xl font-semibold mb-4">eFax Configuration</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Originating Fax Number
          </label>
          <input
            type="number"
            {...register("originating_fax_number", {
              required: "Fax number is required",
            })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.originating_fax_number && (
            <p className="text-red-500 text-sm">
              {errors.originating_fax_number.message}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Choose Date Range
          </label>
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-xs">From</label>
              <input
                type="date"
                {...register("from", { required: "Start date required" })}
                className="border rounded-lg px-3 py-2"
              />
              {errors.from && (
                <p className="text-red-500 text-sm">{errors.from.message}</p>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs">To</label>
              <input
                type="date"
                {...register("to", { required: "End date required" })}
                className="border rounded-lg px-3 py-2"
              />
              {errors.to && (
                <p className="text-red-500 text-sm">{errors.to.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Hospital Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Hospital Name
          </label>
          <input
            type="text"
            {...register("hospital_name", { required: "Hospital name is required" })}
            className="w-full border rounded-lg px-3 py-2"
          />
          {errors.hospital_name && (
            <p className="text-red-500 text-sm">{errors.hospital_name.message}</p>
          )}
        </div>

        {/* Save Discharge Doc */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Save Discharge Doc
          </label>
          <select
            {...register("note_doc", { required: "Selection required" })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Choose</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.note_doc && (
            <p className="text-red-500 text-sm">{errors.note_doc.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="bg-blue-600 text-white px-5 py-2  rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
        {isPending && <div className="text-lg text-center text-gray-500">Data requesting ..., can close. You will be notified once done.</div>}
        {isEfaxError && <div className="text-lg text-center text-red-500">{data?.message || 'Error uploading eFax Configuration.'}</div>}
        {isSuccess && <div className="text-lg text-center text-green-500">{data?.message || 'eFax Configuration uploaded successfully.'}</div>}
      </form>
    </div>
  );
}
