import { useState } from "react";
import { useDispatch } from "react-redux";
import { reviewTempalte } from "../redux/notesSlice";

const ReviewModal = ({ template, onClose, setIsReviewd }) => {
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
        console.log("Final Template:", formData);
        dispatch(reviewTempalte(formData));
        setIsReviewd(true);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-[95%] sm:w-[700px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

                <div className="p-4 border-b flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Review Visit Notes</span>
                        <button className="w-4 h-4 hover:cursor-pointer hover:bg-gray-200 rounded-full" onClick={onClose}>✕</button>
                    </div>

                    {currentIndex === keys.length - 1 && <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm">
                        <span className="font-semibold">Attention:</span>{" "}
                       Please select ‘Save’ to proceed with visit note documentation
                    </div>}
                </div>

                <div className="p-4 overflow-y-auto flex-1">

                    <p className="text-sm text-gray-500 mb-2">
                        Section {currentIndex + 1} of {keys.length}
                    </p>

                    <h3 className="font-semibold capitalize mb-2">
                        {currentKey.replace(/_/g, " ")}
                    </h3>

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
                        className="px-3 py-1 bg-blue-500  text-white rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {currentIndex === keys.length - 1 ? (
                        <div className="flex gap-2">
                            {/* <button
                                onClick={onClose}
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                                Back
                            </button> */}
                            <button
                                onClick={handleSubmit}
                                className="px-3 py-1 bg-green-500 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-3 py-1 bg-blue-500 text-white rounded"
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