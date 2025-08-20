import { useCallback, useState, useEffect, useMemo } from "react";
import { Spinner } from "../components/Spiner";
import CareHeader from "../components/CareHeader";
import SearchInput from "../components/SearchInput";
import PatientList from "../components/PatientList";
import Chat from "../components/Chat";
import AskQuestion from "../components/AskQuestion";
import { useSelector } from "react-redux";
import debounce from "lodash.debounce";

function CareGiver() {
  const patientsList = useSelector((state) => state?.patientnames?.value);
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const { loading, isAskPending } = useSelector((state) => state.askQ);
  const bottom_button = useSelector((state) => state.buttonNames.value);

  const [filterName, setFilterName] = useState("");
  const [inputValue, setInputValue] = useState("");

  const debouncedSetFilterName = useCallback(
    debounce((value) => setFilterName(value), 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetFilterName.cancel();
    };
  }, [debouncedSetFilterName]);

  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterName(value);
  };

  const filterPatient = useMemo(() => {
    return patientsList.filter((patient) =>
      patient?.name.toLowerCase().includes(filterName.trim().toLowerCase())
    );
  }, [patientsList, filterName]);

  const modalContent = {
    "create-progress-notes": <div>Progress Notes Component</div>,
    "ai-agent": <div>AI Agent Component</div>,
    "efax-configuration": <div>eFax Configuration Component</div>,
    "upload-plan": <div>Upload Patients Plan Component</div>,
    "clear-conversations": <div>Clear Conversations Component</div>,
  };

  return (
    <div className="relative">
      <CareHeader />
      <div className="grid grid-cols-12 bg-caregiverbg pl-4 pr-4 h-[87vh]">
        <div className="col-span-2">
          <SearchInput
            placeholder="Search Patient Name ..."
            value={inputValue}
            onChange={handleInputChange}
          />
          <PatientList filterPatient={filterPatient} />
        </div>
        <div className="col-span-10">
          <div className="bg-white h-[58vh] ml-4 rounded mt-12 overflow-auto p-4">
            <Chat />
          </div>

          <div
            className={
              singleDate === null || loading || isAskPending
                ? "pointer-events-none opacity-50"
                : ""
            }
          >
            <AskQuestion />
          </div>
        </div>
      </div>

      {bottom_button && modalContent[bottom_button] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            {modalContent[bottom_button]}
          </div>
        </div>
      )}
    </div>
  );
}

export default CareGiver;
