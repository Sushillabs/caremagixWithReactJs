import { X, Download } from "lucide-react";
import { getCallReport, generateCallReport } from "../api/hospitalApi.js";
import useMyQuery from "../hooks/useMyQuery.js";
import useMyMutation from "../hooks/useMyMutation.js"
import { useState, useMemo } from "react";
import * as XLSX from 'xlsx';


type Patient = {
  patient_name: string;
  to_numbers: number[];
};

type CallReportData = {
  patients: Patient[];
};

type CallReportProps = {
  onClose: () => void;
};

type CallLog = {
  "To number": number;
  "From number": number;
  "Call start time": string;
  Question: string;
  Answer: string;
};

type CallReportResponse = {
  [patientName: string]: CallLog[];
};

const CallReport = ({ onClose }: CallReportProps) => {

  const { data, isSuccess, isError, error } = useMyQuery<CallReportData>({
    api: getCallReport,
    toastId: "getCallReport",
    enabled: true,
  });

  const { data: genData, error: genError, isError: genIsError, isSuccess: genIsSuccess, mutate, mutateAsync } = useMyMutation<CallReportResponse>({ api: generateCallReport, toastId: 'generateCallReport' })

  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    if (!data?.patients || !Array.isArray(data.patients)) return [];
    return data.patients.filter((p: Patient) =>
      p.patient_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const downloadExcel = (data: CallLog[], name: string) => {

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${name}_report.xlsx`);
  };

  const handleDownload = async (patient: Patient) => {
    const payload = {
      patient_name: patient.patient_name,
      to_numbers: patient.to_numbers
    }

    try {
      const res = await mutateAsync(payload)
      if (res) {
        downloadExcel(res[patient.patient_name], patient.patient_name)
      }
    } catch (err) {
      console.error('Error', err);
    }

  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-2/3 max-w-lg relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200"
      >
        <X className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-semibold mb-4">Patient List - Call Report</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patient..."
        className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />
      {isError && <p className="text-red-500">Error: {error?.message}</p>}
      {!data && !isError && <p>Loading...</p>}

      {isSuccess && filteredPatients.length > 0 ? (
        <ul className="space-y-2 overflow-y-auto max-h-64">
          {filteredPatients.map((patient: Patient) => (
            <li
              key={patient.patient_name}
              className="flex justify-between items-center p-2 border border-blue-200 rounded-md"
            >
              <span>{patient.patient_name}</span>
              <button
                onClick={() => handleDownload(patient)}
                className="p-1 rounded hover:bg-gray-200"
              >
                <Download className="w-4 h-4 text-blue-500 hover: cursor-pointer"/>
              </button>
            </li>

          ))}
          {genIsError && (<p className="text-red-600 text-sm mt-1">
            {genError?.response?.data?.error || 'Error registering call.'}
          </p>)}
        </ul>
      ) : (
        isSuccess && <p>No patients found</p>
      )}
    </div>
  );
};

export default CallReport;