import { useCallback, useState, useEffect, useMemo } from "react";
import { Spinner } from "../components/Spiner";
import CareHeader from "../components/CareHeader";
import SearchInput from "../components/SearchInput";
import PatientList from "../components/PatientList";
import Chat from "../components/Chat";
import AskQuestion from "../components/AskQuestion";
import { useSelector, useDispatch } from "react-redux";
import debounce from "lodash.debounce";
import EFaxConfigForm from "../components/EFaxConfigForm";
import { addButtonNames } from "../redux/bottomButtonsSlice";
import UploadPatientPlan from "../components/UploadPatientPlan";
import MobileSideBar from "../components/MobileSideBar";

function CareGiver() {
  const patientsList = useSelector((state) => state?.patientnames?.value);
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const { loading, isAskPending } = useSelector((state) => state.askQ);
  const bottom_button = useSelector((state) => state.buttonNames.value);
  const dispatch = useDispatch();
  const [handleSidebar, setHandleSidebar] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && handleSidebar) {
        setHandleSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleSidebar]);

  const [filterName, setFilterName] = useState("");
  const [inputValue, setInputValue] = useState("");
  // const [openModal, setOpenModal] = useState(false);

  const onClose = useCallback(() => {
    dispatch(addButtonNames(''));
    // setOpenModal(false);
  }, []);

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

  // const filteredPatients = (patientsList || []).filter((p) =>
  //   p?.name?.toLowerCase().includes(filterName?.trim().toLowerCase() || "")
  // );

  const filteredPatients = useMemo(() => {
    const q = (filterName || "").trim().toLowerCase();
    return (patientsList || []).filter((p) =>
      p?.name?.toLowerCase().includes(q)
    );
  }, [patientsList, filterName]);

  const modalContent = {
    "create-progress-notes": <div>Progress Notes Component</div>,
    "ai-agent": <div>AI Agent Component</div>,
    "efax-configuration": <EFaxConfigForm onClose={onClose} />,
    "upload-plan": <UploadPatientPlan onClose={onClose} />,
    "clear-conversations": <div>Clear Conversations Component</div>,
  };

  return (
    <div className="relative  bg-caregiverbg h-screen grid grid-rows-[auto_1fr] overflow-hidden pb-2">
      <CareHeader setHandleSidebar={setHandleSidebar} handleSidebar={handleSidebar} />
      {handleSidebar && <MobileSideBar setHandleSidebar={setHandleSidebar} handleSidebar={handleSidebar} />}
      <div className="grid grid-cols-15 pl-4 pr-4 min-h-0">
        <div className="hidden sm:grid sm:col-span-3 h-full grid-rows-[auto_1fr] min-h-0 gap-1">
          <SearchInput
            placeholder="Search Patient Name ..."
            value={inputValue}
            onChange={handleInputChange}
            // className="mb-4"
          />
          <PatientList filterPatient={filteredPatients} bottom_button={bottom_button} /> 
        </div>
        <div className="col-span-15 sm:col-span-12 h-full grid grid-rows-[1fr_auto] min-h-0">
          <div className="bg-white  sm:ml-4 rounded mt-11 overflow-y-auto min-h-0 p-4">
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
          {modalContent[bottom_button]}
        </div>
      )}
    </div>
  );
}

export default CareGiver;
