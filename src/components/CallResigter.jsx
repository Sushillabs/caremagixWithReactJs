import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { getCallDetail, registerCall } from "../api/hospitalApi";
import { useSelector } from "react-redux";
import { useEffect } from "react";
// import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import useMyMutation from "../hooks/useMyMutation";

const CallRegister = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const { patient_name, patient_type } = useSelector(state => state.patientsingledata.value);

    const { mutate, isPending, error, data: callData } = useMyMutation({
        api: getCallDetail,
        toastId: 'callDetails',
    });

    const { mutate: registerMutate, isPending: isRegisterPending, error: registerError, data: registerData } = useMyMutation({
        api: registerCall,
        toastId: 'registerCall',
    });

    if (!patient_name || !patient_type) {
        return (
            <p className="text-red-600 text-center mt-4">
                Patient or type is missing
            </p>
        );
    }

    useEffect(() => {
        if (patient_name && patient_type) {
            mutate({ patient_name, patient_type });
        }
    }, [patient_name, patient_type]);

    const onSubmit = (data) => {
        console.log("Call Register Data:", data);
        registerMutate(data);
    };

    return (
        <div className="flex justify-center p-4 items-start border border-gray-300 h-full">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-4 border border-gray-300">
                <h1 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                    Request for Medication Call
                </h1>
                {/* <p className="text-green-600">{callData?.message}</p> */}
                {/* <Toaster /> */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient Name
                        </label>
                        <input
                            type="text"
                            value={callData?.patient_name.split("_")[0] || ''}
                            {...register("name", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">
                                Patient name is required
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            value={callData?.phone_number || ''}
                            {...register("mobile", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.mobile && (
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
                            value={callData?.patient_type || ''}
                            {...register("type", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.type && (
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
                            {...register("schedule", { required: true })}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1"
                        />

                        {errors.schedule && (
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
                        Register Call
                    </button>
                    {registerError && (
                        <p className="text-red-600 text-sm mt-1">
                            Error: {registerData?.error || registerError.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CallRegister;
