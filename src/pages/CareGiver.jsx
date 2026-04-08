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
import UploadPlan from "../components/UploadPlan";
import MobileSideBar from "../components/MobileSideBar";
import CallRegister from "../components/CallResigter";
import Mmta from "../components/Mmta";
import MobileRightBar from "../components/MobileRightBar";
import UploadPatientDocument from "../components/UploadPatientDocument";
import { uploadPlan, uploadPatientImage } from "../api/hospitalApi";
import Codes from "../components/Codes";
import CodesForm from "../components/CodesForm";
import CallReport from "../components/CallReport"
import Notes from "../components/Notes";

function CareGiver() {
  const patientsList = useSelector((state) => state?.patientnames?.value);
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const { loading, isAskPending } = useSelector((state) => state.askQ);
  const bottom_button = useSelector((state) => state.buttonNames.value);
  const {value:auth, item} = useSelector((state) => state.auth);
  const {id:headerId,name:headerName}=item;
  console.log('headerName',headerName);
  const dispatch = useDispatch();
  const [handleSidebar, setHandleSidebar] = useState(false);
  const [rightBar, setRightBar] = useState(false);
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
  const handleCreateNotes = () => {
    setActiveTab("create-notes");
  };


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        if (handleSidebar) setHandleSidebar(false);
        if (rightBar) setRightBar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleSidebar, rightBar]);

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

  useEffect(()=>{
    if(bottom_button==='create-visit-notes'){
      setActiveTab("create-notes");
    }
  },[bottom_button])
  const handleInputChange = (value) => {
    setInputValue(value);
    debouncedSetFilterName(value);
  };

  const filteredPatients = useMemo(() => {
    const q = (filterName || "").trim().toLowerCase();
    return (patientsList || []).filter((p) =>
      p?.name?.toLowerCase().includes(q)
    );
  }, [patientsList, filterName]);

  const modalContent = {
    "create-progress-notes": <div>Progress Notes Component</div>,
    "ai-agent": <div>AI Agent Component</div>,
    "efax-configuration": <EFaxConfigForm onClose={onClose} setActiveTab={setActiveTab} />,
    "upload-icd":<CodesForm onClose={onClose} title="ICD"/>,
    "upload-cpt":<CodesForm onClose={onClose} title="CPT"/>,
    "call-report":<CallReport onClose={onClose}/>,
    // "create-visit-notes": <Notes onClose={onClose}/>,
    "upload-plan": (
      <UploadPatientDocument
        onClose={onClose}
        setActiveTab={setActiveTab}
        title="Upload Patient's Plan"
        accept=".pdf,.xml,.docx"
        uploadApi={uploadPlan}
        type="pdf"
      />
    ),

    "upload-image": (
      <UploadPatientDocument
        setActiveTab={setActiveTab}
        onClose={onClose}
        title="Upload Image for OCR"
        accept=".pdf,.xml,.docx,.jpg,.jpeg,.png"
        uploadApi={uploadPatientImage}
        type="image"
      />
    ),
    "clear-conversations": <div>Clear Conversations Component</div>,
  };

  return (
    <div className="relative bg-caregiverbg h-dvh grid grid-rows-[auto_1fr] pb-2">
      <CareHeader setHandleSidebar={setHandleSidebar} handleSidebar={handleSidebar} setRightBar={setRightBar} rightBar={rightBar} />
      {(handleSidebar && !rightBar) && <MobileSideBar setHandleSidebar={setHandleSidebar} handleSidebar={handleSidebar} />}
      {(rightBar && !handleSidebar) && <MobileRightBar setRightBar={setRightBar} />}
      <div className="grid grid-cols-15 pl-4 pr-4 min-h-0">
        <div className="hidden sm:grid sm:col-span-3 h-full grid-rows-[auto_1fr] min-h-0 gap-1">
          <SearchInput
            placeholder="Search Patient Name ..."
            value={inputValue}
            onChange={handleInputChange}
          // className="mb-4"
          />
          {(headerName==="ICD-Codes" ||headerName==="CPT-Codes")&&<Codes/>}
          <PatientList filterPatient={filteredPatients} />
        </div>
        <div className="col-span-15 sm:col-span-12 h-full grid grid-rows-[auto_1fr] min-h-0">
          <div className="text-xs sm:ml-4 grid grid-cols-1 md:grid-cols-3 sm:gap-2">
            <div className="gap-4 flex pb-2 pt-3 ">
              {<button onClick={handleChat} className={`${activeTab === "chat" ? "text-green-600 , border-b-green-600" : ""} hover:cursor-pointer text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-green-600 `}>Chat</button>}
              {<button onClick={handleCallRegister} className={`${activeTab === "callRegister" ? "text-green-600 , border-b-green-600" : ""} hover:cursor-pointer text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-green-600 `}>Call</button>}
              {<button onClick={handleMMTA} className={` ${activeTab === "mmta" ? "text-green-600 , border-b-green-600" : ""} hover:cursor-pointer text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-green-600 `}>MMTA</button>}
              {<button onClick={handleUploadedPlans} className={` ${activeTab === "uploadedPlans" ? "text-green-600 , border-b-green-600" : ""} hover:cursor-pointer text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-green-600 `}>Plan Creation</button>}
              {<button onClick={handleCreateNotes} className={` ${activeTab === "create-notes" ? "text-green-600 , border-b-green-600" : ""} hover:cursor-pointer text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-green-600 `}>Create Notes</button>}
              {/* singleDate && */}
            </div>
            {singleDate && <p className="text-yellow-600 sm:font-bold sm:text-lg text-xs">Patient Name: {singleDate?.patient_name.split("_")[0]}</p>}
          </div>
          <div className="bg-white  sm:ml-4 rounded sm:p-4 min-h-0">

            {activeTab === "chat" && <Chat />}
            {activeTab === "callRegister" && <CallRegister />}
            {activeTab === "mmta" && <Mmta />}
            {activeTab === "uploadedPlans" && <UploadPlan />}
            {activeTab === "create-notes" && <Notes/>}
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
