import { useForm, Controller } from "react-hook-form";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";

const CallRegister = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("Call Register Data:", data);
    };

    return (
        <div className="flex justify-center p-4 items-start border border-gray-300 h-full">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-4 border border-gray-300">
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
                        className="w-full bg-blue-600 text-white py-2 mt-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        Register Call
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CallRegister;
