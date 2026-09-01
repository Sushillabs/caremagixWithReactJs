import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { mmtaV1 } from "../../api/hospitalApi";
import MmtaAnswer from "./mmta/MmtaAnswer";
import { MMTA_DUMMY_RESPONSE } from "./mmta/mmtaDummyData";

export default function MmtaPage() {
  const navigate = useNavigate();
  const singleData = useSelector((state) => state.patientsingledata?.value);
  const chatData = useSelector((state) => state.askQ?.data) || [];
  const question = chatData.at(-1);

  const { mutate, data, isPending, error } = useMutation({ mutationFn: mmtaV1 });

  useEffect(() => {
    if (question) {
      mutate({
        question,
        patient_name: singleData?.patient_name,
        patient_type: singleData?.patient_type,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const usingDummyFallback = !!question && !isPending && (!!error || (!!data && !data?.mmta));
  const mmtaData = data?.mmta || (usingDummyFallback ? MMTA_DUMMY_RESPONSE.mmta : null);

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="font-semibold text-gray-800">MMTA Categorization{singleData?.patient_name ? ` — ${singleData.patient_name}` : ""}</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!question && <p className="text-sm text-gray-400">No question available yet — open the patient's Conversation tab first.</p>}

        {question && isPending && <p className="text-sm text-gray-400">Thinking...</p>}

        {/* Only the response is shown — no "Q:" line, matches existing convention. */}

        {question && !isPending && usingDummyFallback && (
          <p className="mb-3 text-xs font-medium text-amber-600">
            Showing sample data — {error ? "the request failed." : "the response didn't include structured data yet."}
          </p>
        )}

        {question && !isPending && mmtaData && <MmtaAnswer mmta={mmtaData} />}
      </div>
    </div>
  );
}
