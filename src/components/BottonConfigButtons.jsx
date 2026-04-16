
import { MdCreate, MdDelete } from "react-icons/md";
import { FaUser, FaRegStickyNote, FaUpload } from "react-icons/fa";
import { SiReacthookform } from "react-icons/si";
import { GrConfigure } from "react-icons/gr";
import { addButtonNames } from '../redux/bottomButtonsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getPccData, fillCMS485, dischargePlan } from '../api/hospitalApi';
import useMyQuery from '../hooks/useMyQuery';
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import useMyMutation from "../hooks/useMyMutation";
import { FaArrowsSpin } from "react-icons/fa6";
import { fetchPatientChat, clearChat, addQconversation } from '../redux/chatSlice';
import { clearNotes } from "../redux/notesSlice";
import {fetchDischargePlan} from "../redux/notesSlice";

const BottonConfigButtons = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const patientData = useSelector((state) => state.patientsingledata.value)
  const { id: headerId } = useSelector((state) => state.auth.item);

  console.log('headerId', headerId);

  const { data, error, isSuccess, isError, isPending, isFetching, refetch } = useMyQuery({
    api: getPccData,
    id: 'pccData',
    enabled: false
  });
  // console.log('all data fron query while fetching pcc', data, error, isLoading, isFetching);
  const { data: CMS_data, error: CMS_error, isError: CMS_isError, isPending: CMS_isPending, isFetching: CMS_isFetching, mutate, mutateAsync } = useMyMutation({ api: fillCMS485, toastId: 'fillCMS485' })




  let bottom_buttons = [
    { id: "pull-pcc", name: "Pull PCC Data", icon: <FaArrowsSpin />, requirePatient: false },
    { id: "efax-configuration", name: "eFax Configuration", icon: <GrConfigure />, requirePatient: false },
    { id: "upload-plan", name: "Upload Patients Plan", icon: <FaUpload />, requirePatient: false },
    { id: "upload-image", name: "Upload Image", icon: <FaUpload />, requirePatient: false },
    { id: "create-visit-notes", name: "Create Visit Notes", icon: <FaUser />, requirePatient: true },
    { id: "fil-cms-485", name: "Fill CMS 485", icon: <SiReacthookform />, requirePatient: true },
    { id: "fil-oasis-e", name: "Fill OASIS-E", icon: <SiReacthookform />, requirePatient: true },
    { id: "create-progress-notes", name: "Create Progress Notes", icon: <MdCreate />, requirePatient: true },
    { id: "upload-icd", name: "Upload ICD Codes", icon: <FaUpload />, requirePatient: false },
    { id: "upload-cpt", name: "Upload CPT Codes", icon: <FaUpload />, requirePatient: false },
    { id: "medication-alert", name: "Medication Alerts", icon: <FaUpload />, requirePatient: true },
    { id: "call-report", name: "Call Reports", icon: <FaUpload />, requirePatient: false },
    { id: "set-caller-id", name: "Set Caller Id", icon: <FaUpload />, requirePatient: false },
    { id: "ai-agent", name: "AI Agent", icon: <FaUser />, requirePatient: false },
    { id: "clear-conversations", name: "Clear Conversations", icon: <MdDelete />, requirePatient: false },
  ];

  const pccData = async () => {
    toast.loading('Fetching PCC Data...', { id: 'pcc-toast' });
    try {
      const result = await refetch();
      console.log('PCC Data fetch result:', result);
      queryClient.invalidateQueries({ queryKey: ['patientList'] });
      // dispatch(addButtonNames('pcc-data-fetched')); // to trigger patient list
      toast.success('PCC Data fetched successfully', { id: 'pcc-toast' });
      // console.log('PCC Data:', result.data);
    } catch (error) {
      toast.error('Error fetching PCC Data', { id: 'pcc-toast' });
      console.error('Error fetching PCC Data:', error);
    }
  };

  const createNotes = async () => {

    dispatch(clearNotes())
    const { patient_name, patient_type } = patientData || {}
    const payload = {
      action: 'get_template',
      patient_name,
      patient_type
    }

    dispatch(fetchDischargePlan(payload))
    // try {
    //   const res = await notes_mutateAsync(payload)
    //   if (res) {
    //     dispatch(addTemplate(res));
    //   }
    // } catch (error) {
    //   console.error('Error in get Tamplate', error);
    // }
  }

  const handleLeftButtonClick = async (id) => {
    console.log("Button clicked:", id);
    const button = bottom_buttons.find(btn => btn.id === id);

    if (button?.requirePatient && !patientData) {
      toast.error("⚠️ Please select a patient", {
        position: "top-center",
      });
      return;
    }
    console.log('dispatch',dispatch)
    dispatch(addButtonNames(id));

    switch (id) {
      case "fil-cms-485": {
        try {
          const { patient_name, patient_type, dates } = patientData;

          const payload = {
            form_name: "CMS-485",
            patient_name,
            patient_type,
            dates,
          };

          const res = await mutateAsync(payload);

          if (res?.form_link) {
            window.open(res.form_link, "_blank");
          } else {
            alert("Form link not found in response.");
            console.error("Invalid response:", res);
          }
        } catch (err) {
          console.error("Error generating form:", err);
        }
        break;
      }
      case "pull-pcc":
        pccData();
        break;
      case "create-visit-notes":
        createNotes();
        break;
      // case "upload-plan":
      //   break;
      // case "create-progress-notes":
      //   break;
      // case "ai-agent":
      //   break;
      // case "clear-conversations":
      //   break;
      default:
        console.warn("Unhandled button id:", id);
        break;
    }
  };


  return (
    <ul className='flex flex-col gap-1 overflow-y-auto min-h-0'>
      {bottom_buttons && bottom_buttons.map((button) => {
        if (button.id === 'upload-icd' && headerId !== 'icd_codes') return null;
        if (button.id === 'upload-cpt' && headerId !== 'cpt_codes') return null;
        const isCMS485 = button.id === "fil-cms-485";
        const disabled =
          ((isCMS485 || button.id === "fil-oasis-e") && !patientData) ||
          (isCMS485 && CMS_isPending);
        return <li key={button.id}
          title={disabled ? "Please select patient" : ""}
          onClick={() => {
            if (disabled) return;
            handleLeftButtonClick(button.id);
          }}
          className={`flex items-center gap-1 py-2 px-1
          ${button.name === 'Clear Conversations'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white hover:bg-green-500'}
          
          ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:text-white'}
          
          border border-green-500 text-gray-700 rounded-md`}
        >
          {button.icon}<span>{isCMS485 && CMS_isPending ? "Filling CMS 485..." : button.name}</span>
        </li>

      })}
    </ul>
  )
  // className=" flex gap-2 items-center border border-black p-1 rounded-2xl bg-white text-md cursor-pointer hover:bg-gray-400">
}

export default BottonConfigButtons