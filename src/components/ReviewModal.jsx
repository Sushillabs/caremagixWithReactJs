import { useState } from "react";
import { useDispatch } from "react-redux";
import { reviewTempalte } from "../redux/notesSlice";

const ReviewModal = ({ template, onClose }) => {
    const keys = Object.keys(template || {});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [formData, setFormData] = useState(template);
    const dispatch=useDispatch();

    const currentKey = keys[currentIndex];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [currentKey]: e.target.value
        });
    };

    const handleNext = () => {
        if (currentIndex < keys.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        dispatch(reviewTempalte(formData));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-[95%] sm:w-[700px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

                <div className="p-4 border-b bg-gray-50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Edit Visit Note</span>
                        <button className="w-4 h-4 hover:cursor-pointer hover:bg-gray-200 rounded-full" onClick={onClose}>✕</button>
                    </div>

                    {currentIndex === keys.length - 1 && <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm">
                        <span className="font-semibold">Attention:</span>{" "}
                       Please select ‘Save’ to proceed with visit note documentation
                    </div>}
                </div>

                <div className="p-4 overflow-y-auto flex-1">

                    <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-emerald-50 p-3 mb-3 text-xs sm:text-sm">
                        {keys.map((key, idx) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`whitespace-nowrap hover:cursor-pointer ${
                                    idx === currentIndex
                                        ? "font-semibold text-emerald-800 underline"
                                        : "text-emerald-600 hover:text-emerald-800"
                                }`}
                            >
                                {idx + 1}. {key.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-md bg-emerald-800 px-3 py-2 mb-3">
                        <span className="text-sm font-semibold text-white capitalize">
                            {currentKey.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-emerald-100 truncate max-w-[50%]">
                            {formData[currentKey] || ""}
                        </span>
                    </div>

                    <textarea
                        value={formData[currentKey] || ""}
                        onChange={handleChange}
                        className="w-full min-h-[150px] border rounded p-2 text-sm"
                    />

                </div>

                <div className="p-4 border-t flex justify-between items-center">

                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {currentIndex === keys.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded"
                        >
                            Next
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ReviewModal;