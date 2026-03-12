import { useForm, Controller } from "react-hook-form";
// import { useMutation } from '@tanstack/react-query';
import { getCallDetail, registerCall, unregisterCall } from "../api/hospitalApi";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
// import { Toaster } from "react-hot-toast";
// import toast from "react-hot-toast";
import useMyMutation from "../hooks/useMyMutation";
import { useQueryClient } from "@tanstack/react-query";
import { updatePatientData } from "../redux/PatientSingleDateSlice";
import PhoneInput from "react-phone-number-input";



const CallRegister = () => {
    const [showForm, setShowForm] = useState(false);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm();
    const value = useSelector(state => state.patientsingledata?.value);
    const patient_name = value?.patient_name;
    const patient_type = value?.patient_type;

    const { mutate, isPending, error, data: callData } = useMyMutation({
        api: getCallDetail,
        toastId: 'callDetails',
    });

    const { mutate: registerMutate, isPending: isRegisterPending, isSuccess: isRegisterSuccess, error: registerError, data: registerData, mutateAsync: registerMutateAsync } = useMyMutation({
        api: registerCall,
        toastId: 'registerCall',
    });

    const { data, error: unRegisterError, isError: isUnRegisteringError, isPending: isUnRegistering, isSuccess, mutate: unRegisterMutate, mutateAsync: unRegisterMutateAsync } = useMyMutation({
        api: unregisterCall,
        toastId: 'unregisterCall',
    })

    const isCallRegistered = value?.patient?.raw?.call_registered;

    useEffect(() => {
        if (!callData) return;

        reset({
            patient_name: callData?.patient_name?.split("_")[0] || "",
            to_number: callData?.phone_number || "",
            patient_type: callData?.patient_type || "",
        });
    }, [callData, reset]);

    if (isUnRegistering) {

        return (
            <p className="text-blue-500 text-center mt-4">
                Unregistering call...
            </p>
        );
    }
    if (isSuccess) {
        return (
            <p className="text-green-600 text-center mt-4">
                Call unregistered successfully.
            </p>
        );
    }
    if (isUnRegisteringError) {
        return (
            <p className="text-red-600 text-center mt-4">
                Error unregistering call.
            </p>
        );
    }

    if (!patient_name || !patient_type) {
        return (
            <p className="text-red-600 text-center mt-4">
                Select patient from List.
            </p>
        );
    }

    const handleClick = async () => {
        if (value?.patient?.raw?.call_registered) {
            try {
                const res = await unRegisterMutateAsync({ to_number: value?.patient?.raw?.calling_number });
                console.log("Unregister Response:", res);
                if (res) {
                    dispatch(updatePatientData({ call_registered: false }));
                }
            } catch (err) {
                console.error("Unregister Error:", err);
            }

        } else {
            setShowForm(true);
            if (patient_name && patient_type) {
                mutate({ patient_name, patient_type });
            }
        }
    }

    const onSubmit = async (data) => {
        console.log("Call Register Data:", data);
        const dates = value?.dates
        const call_payload = { ...data, dates };
        try {
            const res = await registerMutateAsync(call_payload);
            console.log("Register Response:", res);
            if (res) {
                dispatch(updatePatientData({ call_registered: true }));
                setShowForm(false);
            }
        } catch (err) {
            console.error("Register Error:", err);
        }

    };
    console.log('form stattus', showForm);

    return (
        <div className="flex flex-col p-4 items-center border border-gray-300 h-full">
            <div className="text-center mb-4">
                <p
                    className="text-green-600 text-sm sm:text-lg mb-2"
                >
                    {isCallRegistered ? 'Call is registered, click below to unregister' : 'Call is not registered, click below to register'}
                </p>
                {!showForm && <button
                    onClick={handleClick}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >{isCallRegistered ? 'Call Unregister' : 'Call Register'}
                </button>}
            </div>
            
            {showForm && <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-4 border border-gray-300">
                <h1 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                    Request for Medication Call
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient Name
                        </label>
                        <input
                            type="text"
                            // value={callData?.patient_name.split("_")[0] || ''}
                            {...register("patient_name", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.patient_name && (
                            <p className="text-red-600 text-sm mt-1">
                                Patient name is required
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <Controller
                            name="to_number"
                            control={control}
                            rules={{ required: "Mobile number is required" }}
                            render={({ field }) => (
                                <PhoneInput
                                    {...field}
                                    defaultCountry="US"
                                    international
                                    className="w-full rounded-lg border border-gray-300 px-2 py-1"
                                />
                            )}
                        />
                        {errors.to_number && (
                            <p className="text-red-600 text-sm mt-1">
                                Mobile number is required
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient Type
                        </label>
                        <input
                            type="text"
                            // value={callData?.patient_type || ''}
                            {...register("patient_type", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.patient_type && (
                            <p className="text-red-600 text-sm mt-1">
                                Patient type is required
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule Time
                        </label>

                        <input
                            type="datetime-local"
                            {...register("time_slots", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1"
                        />

                        {errors.time_slots && (
                            <p className="text-red-600 text-sm mt-1">
                                Schedule time is required
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-blue-600 text-white py-2 mt-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50`}
                        disabled={isRegisterPending}
                    >
                        {isRegisterPending ? 'Registering...' : 'Register Call'}
                    </button>
                    {registerError && (
                        <p className="text-red-600 text-sm mt-1">
                            {registerError?.response?.data?.error || 'Error registering call.'}
                        </p>
                    )}
                </form>
            </div>}
        </div>
    );
};

export default CallRegister;
