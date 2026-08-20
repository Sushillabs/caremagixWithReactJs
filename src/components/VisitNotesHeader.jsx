import { useState } from "react";
import { useSelector } from "react-redux";
import { FaRegEdit, FaDownload, FaEnvelope } from "react-icons/fa";
import ReviewModal from "./ReviewModal";
import SendEmailModal from "./SendEmailModal";

const VisitNotesHeader = () => {
    const [showReview, setShowReview] = useState(false);
    const [showEmail, setShowEmail] = useState(false);

    const { template, isEditLocked, templateReadyForReview, savedAt, reviewable_template } = useSelector((state) => state.notes);

    const pdfPath = template?.data?.pdf_path;
    const canReview = templateReadyForReview && !isEditLocked;
    const canActOnPdf = !!pdfPath;

    const handleDownload = () => {
        if (pdfPath) {
            window.open(pdfPath, '_blank');
        }
    };

    const btnClass = "flex items-center gap-1 rounded-md px-2 py-1 text-xs sm:text-sm text-white bg-blue-600 hover:cursor-pointer hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400";

    return (
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-2 bg-[#F0FDF4]">
            <div>
                <h3 className="text-sm font-bold text-gray-800">Visit notes</h3>
                {savedAt && (
                    <p className="text-xs text-gray-400">
                        Last Generated on {new Date(savedAt).toLocaleString()}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <button type="button" className={btnClass} disabled={!canReview} onClick={() => setShowReview(true)}>
                    <FaRegEdit /> Review & Edit
                </button>
                <button type="button" className={btnClass} disabled={!canActOnPdf} onClick={() => setShowEmail(true)}>
                    <FaEnvelope /> Send Email
                </button>
                <button type="button" className={btnClass} disabled={!canActOnPdf} onClick={handleDownload}>
                    <FaDownload /> Download
                </button>
            </div>

            {showReview && (
                <ReviewModal
                    template={reviewable_template}
                    onClose={() => setShowReview(false)}
                />
            )}
            {showEmail && <SendEmailModal onClose={() => setShowEmail(false)} />}
        </div>
    );
};

export default VisitNotesHeader;
