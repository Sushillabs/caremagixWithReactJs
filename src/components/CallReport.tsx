import { X, Download } from "lucide-react";
import { getCallReport } from "../api/hospitalApi.js";
import useMyQuery from "../hooks/useMyQuery.js";
import { useState, useMemo } from "react";


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

const CallReport = ({ onClose }: CallReportProps) => {
  const { data, isSuccess, isError, error } = useMyQuery<CallReportData>({
    api: getCallReport,
    toastId: "getCallReport",
    enabled: true,
  });

  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    if (!data?.patients || !Array.isArray(data.patients)) return [];
    return data.patients.filter((p:Patient) =>
      p.patient_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

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
        <ul className="space-y-2">
          {filteredPatients.map((patient:Patient)=> (
            <li
              key={patient.patient_name}
              className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"
            >
              <span>{patient.patient_name}</span>
              <button
                onClick={() => {
                  console.log("Download for:", patient.patient_name);
                }}
                className="p-1 rounded hover:bg-gray-200"
              >
                <Download className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        isSuccess && <p>No patients found</p>
      )}
    </div>
  );
};

export default CallReport;