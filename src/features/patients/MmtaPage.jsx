import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { mmta } from "../../api/hospitalApi";

export default function MmtaPage() {
  const navigate = useNavigate();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const chatData = useSelector((state) => state.askQ?.data) || [];
  const question = chatData.at(-1);

  const { mutate, data, isPending, error } = useMutation({ mutationFn: mmta });

  useEffect(() => {
    if (question) mutate({ question });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="font-semibold text-gray-800">MMTA Categorization{singleData?.patient_name ? ` — ${singleData.patient_name}` : ""}</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!question && (
          <p className="text-sm text-gray-400">No question available yet — open the patient's Conversation tab first.</p>
        )}

        {question && (
          <p className="mb-3 text-sm text-gray-700">
            <span className="font-medium">Q:</span> {question}
          </p>
        )}

        {isPending && <p className="text-sm text-gray-400">Thinking...</p>}

        {error && (
          <p className="text-sm text-red-600">{error?.response?.data?.error || error?.response?.data?.message || "Something went wrong."}</p>
        )}

        {data?.response && (
          <div className="text-sm text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.response}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
