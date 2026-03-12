import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { uploadPlan } from "../api/hospitalApi";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import CreateSelectable from "react-select/creatable";
import PhoneInput from "react-phone-number-input";
import { sendOTP, verifyOTP } from "../api/hospitalApi";
import useMyMutation from "../hooks/useMyMutation";
import {useDispatch} from "react-redux"
// import { useDispatch } from "react-redux";
import { setJobsId } from "../redux/jobsIdslice";

export default function UploadPatientDocument({ onClose, setActiveTab, title, accept, uploadApi, type }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm();
  const dispatch=useDispatch();
  const queryClient = useQueryClient();
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [shouldShowOTPInput, setShouldShowOTPInput] = useState(false);
  const { data, mutate, mutateAsync, isSuccess, isPending, isError } = useMyMutation({ api: sendOTP, toastId: 'sendOTP' })
  const { data: verifyData, mutate: verifyMutate, mutateAsync: verifyMutateAsync, isSuccess: isVerifySuccess, isPending: isVerifyPending, isError: isVerifyError } = useMyMutation({ api: verifyOTP, toastId: 'verifyOTP' })

  const [showMobile, setShowMobile] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const [otp, setOTP] = useState("");

  const selectedPatientName = watch("patient_name");
  const isNewPatient = selectedPatientName?.__isNew__;

  const isExistingPatient = !isNewPatient;
  const shouldShowVerification = isNewPatient && !isOtpVerified;
  const shouldShowForm = isExistingPatient || isOtpVerified;

  const patientList = useSelector(state => state.patientnames.value);

  const patientOptions = patientList.filter((patient) => patient.type === "data").map((patient) => ({
    value: patient.name,
    label: patient.name
  }));

  const [loading, setLoading] = useState(false);


  const handleMobileClick = () => {
    setShowMobile(true);
    setShowEmail(false);
  }
  const handleEmailClick = () => {
    setShowEmail(true);
    setShowMobile(false);
  }

  const handleSendOTP = async () => {
    const payload = { identifier: inputValue }
    try {
      const res = await mutateAsync(payload);
      if (res.success) {
        setShouldShowOTPInput(true);
      }
      console.log("OTP sent response:", res);
    } catch (err) {
      console.error("Error sending OTP:", err.message);
    }

  }
  const handleVerify = async () => {
    const payload = { identifier: inputValue, otp: otp }
    try {
      const res = await verifyMutateAsync(payload);
      if (res.verified) {
        if (showEmail) {
          setValue("email", res?.data);
          setIsOtpVerified(true);
        }
        if (showMobile) {
          setValue("mobile", res?.data);
          setIsOtpVerified(true);
        }

      }
      console.log("OTP verify response:", res);
    } catch (err) {
      console.error("Error verifying OTP:", err.message);
    }
  }

  useEffect(() => {
    setIsOtpVerified(false);
    setOTP("");
    setInputValue("");
    setShouldShowOTPInput(false);
  }, [selectedPatientName]);

  useEffect(() => {
    if (!selectedPatientName) return;

    // If NEW patient (OTP flow handles it)
    if (selectedPatientName?.__isNew__) {
      setValue("email", "");
      setValue("mobile", "");
      return;
    }

    // EXISTING PATIENT
    const selectedName = selectedPatientName.value;

    const fullPatient = patientList.find(
      (p) => p.name === selectedName
    );

    if (fullPatient) {
      setValue("email", fullPatient?.raw?.registered_email || "");
      setValue("mobile", fullPatient?.raw?.registered_number || "");
    }

  }, [selectedPatientName, patientList, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    clearErrors('root');

    if (!data.file || data.file.length === 0) {
      setError("root", { type: "manual", message: "Please select a file to upload." });
      return;
    }
    if (data.email === "" && data.mobile === "") {
      setError("root", { type: 'manual', message: "Mobile or Email is required" })
      return;
    }

    const file = data.file[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    const formData = new FormData();

    formData.append("patient_name", data.patient_name.value);
    formData.append("confirm", "false");
    formData.append("email", data.email || "");
    formData.append("mobile", data.mobile || "");
    formData.append("file_type", fileType);

    if (type === 'image') {
      formData.append("image_type", data.plan);
      formData.append("image", file); 
      formData.append("doc_title", data.keep_doc);    
    } else {     
      formData.append("patient_type", data.plan);
      formData.append("file", file);
      formData.append("patient_doc", data.keep_doc);
    }

    console.log("Submitting FormData:", data);

    try {
      const res = await uploadApi(formData);
      console.log("Upload Plan API response:", res);

      if (res) {
        if (type === 'image') {
          dispatch(setJobsId({ eFaxJobs: null, ocrJobs: res }));
          setActiveTab("uploadedPlans");
          setTimeout(() => {
            onClose();
          }, 4000);
        }

        reset({
          patient_name: null,
          email: "",
          mobile: "",
          plan: "",
          keep_doc: "",
          file: null
        });
        queryClient.invalidateQueries({ queryKey: ['patientList'] });// refetch patient list
        setError("root", {
          type: "success",
          message: "File uploaded successfully."
        });
      }


    } catch (err) {
      console.log(err);
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message||err?.message || "Something went wrong."
      });
      // console.error("Error uploading plan:", err.message);

    } finally {
      setLoading(false);
    }
  };


  return (
    // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Name
          </label>
          <Controller
            name="patient_name"
            control={control}
            rules={{ required: "Patient name is required" }}
            render={({ field }) => (
              <CreateSelectable
                {...field}
                options={patientOptions}
                placeholder="Search or add new patient"
              // onChange={(value) => field.onChange(value)}
              />
            )}

          />
          {errors.patient_name && (
            <p className="text-red-500 text-sm">{errors.patient_name.message}</p>
          )}
        </div>
        {shouldShowForm && <div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              readOnly
              className="w-full border rounded-lg px-3 py-1"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile</label>
            <input
              type="text"
              {...register("mobile")}
              readOnly
              className="w-full border rounded-lg px-3 py-1"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Plan</label>
            <select
              {...register("plan", { required: "Please select a plan" })}
              className="w-full border rounded-lg px-3 py-1"
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

          <div>
            <label className="block text-sm font-medium mb-1">Keep Doc</label>
            <select
              {...register("keep_doc", { required: "Please choose an option" })}
              className="w-full border rounded-lg px-3 py-1"
            >
              {/* <option value="">Choose</option> */}
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.keep_doc && (
              <p className="text-red-500 text-sm">{errors.keep_doc.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload File</label>
            <input
              type="file"
              accept={accept}
              {...register("file", { required: "File is required" })}
              className="w-full border rounded-lg px-3 py-1 bg-white"
            />
            {errors.file && (
              <p className="text-red-500 text-sm">{errors.file.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>

          </div>
          {errors.root && (
            <p
              className={`text-sm mt-2 text-center ${errors.root.type === "success" ? "text-green-600" : "text-red-500"}`}
            >
              {errors.root.message}
            </p>
          )}
        </div>}

      </form>
      {shouldShowVerification && <div>
        <p className="font-semibold mt-4 text-center text-lg">Verify Contacts</p>
        <div className="flex gap-4 mb-4 border-b pb-2">
          <button disabled={shouldShowOTPInput} className={`text-blue-600 ${showEmail ? 'text-gray-400' : ''}`} onClick={handleMobileClick}>Mobile</button>
          <button disabled={shouldShowOTPInput} className={`text-blue-600  ${showMobile ? 'text-gray-400' : ''}`} onClick={handleEmailClick}>Email</button>
        </div>
        {showMobile && <div className="flex gap-6">
          <PhoneInput
            defaultCountry="US"
            international
            placeholder="Enter phone number"
            className="rounded-lg border border-gray-3000 px-2 py-1"
            onChange={(value) => setInputValue(value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleSendOTP}>Send OTP</button>
        </div>}
        {showEmail && <div className="flex gap-6">
          {!shouldShowOTPInput && <input onChange={(e) => setInputValue(e.target.value)} type="email" placeholder="Enter email address" className="rounded-lg border border-gray-3000 px-2 py-1" />}
          {shouldShowOTPInput && <input onChange={(e) => setOTP(e.target.value)} type="number" placeholder="Enter OTP" className="rounded-lg border border-gray-3000 px-2 py-1" />}
          {!shouldShowOTPInput && <button className={`${isPending ? 'bg-gray-200 cursor-not-allowed' : ''}bg-blue-600 text-white px-4 py-2 rounded-lg`} onClick={handleSendOTP}>Send OTP</button>}
          {shouldShowOTPInput && <button className={`${isVerifyPending ? 'bg-gray-200 cursor-not-allowed' : ''} bg-blue-600 text-white px-4 py-2 rounded-lg`} onClick={handleVerify}>Verify OTP</button>}
        </div>}


      </div>}
    </div>
    // </div>
  );
}
