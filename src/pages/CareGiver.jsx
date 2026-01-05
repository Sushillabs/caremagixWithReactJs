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
import CallRegister from "../components/CallResigter";
import Mmta from "../components/Mmta";

function CareGiver() {
  const patientsList = useSelector((state) => state?.patientnames?.value);
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const { loading, isAskPending } = useSelector((state) => state.askQ);
  const bottom_button = useSelector((state) => state.buttonNames.value);
  const dispatch = useDispatch();
  const [handleSidebar, setHandleSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const handleChat = () => {
    setActiveTab("chat");
  };
  const handleCallRegister = () => {
    setActiveTab("callRegister");
  }
  const handleMMTA = () => {
    setActiveTab("mmta");
  };
  const handleUploadedPlans = () => {
    setActiveTab("uploadedPlans");
  };


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && handleSidebar) {
        setHandleSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleSidebar]);

  useEffect(() => {
    if (singleDate) {
      setHandleSidebar(false);
    }
  }, [singleDate]);

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
      {(handleSidebar) && <MobileSideBar setHandleSidebar={setHandleSidebar} handleSidebar={handleSidebar} />}
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
        <div className="col-span-15 sm:col-span-12 h-full grid grid-rows-[auto_1fr] min-h-0">
          <div className="text-sm sm:ml-4 mb-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              {singleDate&& <button onClick={handleChat} className={`bg-green-500 ${activeTab === "chat" ? "text-white , bg-green-600" : "text-gray-500"} border-r border-gray-200 px-2 py-2 hover:bg-green-600 hover:cursor-pointer`}>Chat</button>}
              {singleDate&& <button onClick={handleCallRegister} className={`bg-green-500 ${activeTab === "callRegister" ? "text-white , bg-green-600" : "text-gray-500"} border-r border-gray-200 px-2 py-2 hover:bg-green-600 hover:cursor-pointer`}>Call Register</button>}
              {singleDate&& <button onClick={handleMMTA} className={`bg-green-500 ${activeTab === "mmta" ? "text-white , bg-green-600" : "text-gray-500"} border-r border-gray-200 px-2 py-2 hover:bg-green-600 hover:cursor-pointer`}>MMTA</button>}
              {singleDate&& <button onClick={handleUploadedPlans} className={`bg-green-500 ${activeTab === "uploadedPlans" ? "text-white , bg-green-600" : "text-gray-500"} px-2 py-2 hover:bg-green-600 hover:cursor-pointer`}>Uploaded Plans</button>}
            </div>
            {singleDate && <p className="text-yellow-600 font-bold text-lg ">Patient Name: {singleDate?.patient_name.split("_")[0]}</p>}
          </div>
          <div className="bg-white  sm:ml-4 rounded sm:p-4 min-h-0">
            {activeTab === "chat" && <Chat />}
            {activeTab === "callRegister" && <CallRegister />}
            {activeTab === "mmta" && <Mmta />}
            {activeTab === "uploadedPlans" && <div>Uploaded Plans Content</div>}
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
