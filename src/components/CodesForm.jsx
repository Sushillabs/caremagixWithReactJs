import { X } from "lucide-react";
import { useState } from "react";
import useMyMutation from "../hooks/useMyMutation";
import { useSelector, useDispatch } from "react-redux";
import { uploadPlan } from "../api/hospitalApi";
import useMyQuery from "../hooks/useMyQuery";
import { getICDCodes, getCPTCodes } from "../api/hospitalApi";
import { addICD, addCPT } from "../redux/codesSlice";

const CodesForm = ({ onClose, title }) => {
    const [plan, setPlan] = useState('');
    const [file, setFile] = useState(null);
    const dispatch = useDispatch();
    const headerName = useSelector((state) => state.auth.item.name);

    const { data, error, isError, isSuccess, isPending, mutate, mutateAsync } = useMyMutation({ api: uploadPlan, toastId: 'uploadPlan' })
    const { data: icd_data, error: icd_Error, isSuccess: icd_isSuccess, isError: icd_isError, isPending: icd_isPending, isFetching: icd_isFetching, refetch: icd_refetch } = useMyQuery({ api: getICDCodes, id: 'icd', enabled: false })
    const { data: cpt_data, error: cpt_Error, isSuccess: cpt_isSuccess, isError: cpt_isError, isPending: cpt_isPending, isFetching: cpt_isFetching, refetch: cpt_refetch } = useMyQuery({ api: getCPTCodes, id: 'cpt', enabled: false })


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("file", file)
        formData.append("file_type", 'pdf')
        formData.append("patient_type", headerName)
        formData.append("patient_name", headerName)
        formData.append("confirm", false)

        const res = await mutateAsync(formData);
        console.log("res in codeform", res)
        if (res) {
            // console.log("res in codeform", res)
            let codesID
            if (res?.patient_type === 'ICD-Codes') {
                const res = await icd_refetch();
                if (res.isSuccess) {
                    const formatedPatients = (res?.data?.data || []).map((p) => ({
                        type: "data",
                        name: p.name,
                        raw: p,
                    }));
                    dispatch(addICD(formatedPatients))
                    codesID = 'icd_codes'
                }
               
            }
            
            if (res?.patient_type === 'CPT-Codes') {
                const res = await cpt_refetch();
                if (res.isSuccess) {
                    const formatedPatients = (res?.data?.data || []).map((p) => ({
                        type: "data",
                        name: p.name,
                        raw: p,
                    }));
                    dispatch(addCPT(formatedPatients))
                }
                codesID = 'cpt_codes'
            }

            //  dispatch(setHederKey({ id: codesID, name: headerName }))
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">

            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
            >
                <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Upload {title} Codes
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Select Plan</label>
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                    >
                        <option value={`${title}-Codes`}>{title} Codes</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Select File</label>
                    <input
                        onChange={(e) => setFile(e.target.files[0])}
                        type="file"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50`}
                    disabled={isPending}
                >
                    Submit
                </button>
                {isError && <p className="text-red-500 text-xs text-center">{error?.response?.data?.message || error.message}</p>}
                {isSuccess && <p className="text-green-500 text-xs text-center">Data Uploaded successfully</p>}
            </form>
        </div>
    );
};

export default CodesForm;