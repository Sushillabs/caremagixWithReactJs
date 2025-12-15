import React from 'react'
import { MdCreate, MdDelete } from "react-icons/md";
import { FaUser, FaRegStickyNote, FaUpload } from "react-icons/fa";
import { GrConfigure } from "react-icons/gr";
import { addButtonNames } from '../redux/bottomButtonsSlice';
import { useDispatch } from 'react-redux';

const BottonConfigButtons = () => {
  const dispatch = useDispatch();
  let bottom_buttons = [
    { id: "create-progress-notes", name: "Create Progress Notes", icon: <MdCreate /> },
    { id: "edit-handoff", name: "Edit Handoff Template", icon: <FaUser /> },
    { id: "pull-pcc", name: "Pull PCC Data", icon: <FaUser /> },
    { id: "efax-configuration", name: "eFax Configuration", icon: <GrConfigure /> },
    { id: "upload-plan", name: "Upload Patients Plan", icon: <FaUpload /> },
    { id: "upload-image", name: "Upload Image", icon: <FaUpload /> },
    { id: "upload-icd", name: "Upload ICD Codes", icon: <FaUpload /> },
    { id: "upload-cpt", name: "Upload CPT Codes", icon: <FaUpload /> },
    { id: "medication-alert", name: "Medication Alerts", icon: <FaUpload /> },
    { id: "call-report", name: "Call Reports", icon: <FaUpload /> },
    { id: "set-caller-id", name: "Set Caller Id", icon: <FaUpload /> },
    { id: "ai-agent", name: "AI Agent", icon: <FaUser /> },
    { id: "clear-conversations", name: "Clear Conversations", icon: <MdDelete /> },
  ];
  const handleLeftButtonClick = (id) => {
    console.log("Button clicked:", id);
    dispatch(addButtonNames(id));
  }
  return (
    <ul className='flex flex-col gap-1 overflow-auto sm:h-[38vh] h-[45vh]'>
      {bottom_buttons && bottom_buttons.map((button) => {
        return <li key={button.id}
          onClick={() => handleLeftButtonClick(button.id)}
          className={`flex items-center gap-1 py-2 px-1 ${button.name === 'Clear Conversations' ? 'bg-red-500 hover:bg-red-600': 'bg-green-600 hover:bg-green-700' } cursor-pointer  text-white rounded-md`}>
          {button.icon} <span>{button.name}</span>
        </li>
      })}
    </ul>
  )
  // className=" flex gap-2 items-center border border-black p-1 rounded-2xl bg-white text-md cursor-pointer hover:bg-gray-400">
}

export default BottonConfigButtons