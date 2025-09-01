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
    { id: "ai-agent", name: "AI Agent", icon: <FaUser /> },
    { id: "efax-configuration", name: "eFax Configuration", icon: <GrConfigure /> },
    { id: "upload-plan", name: "Upload Patients Plan", icon: <FaUpload /> },
    { id: "clear-conversations", name: "Clear Conversations", icon: <MdDelete /> },
  ];
  const handleLeftButtonClick = (id) => {
    console.log("Button clicked:", id);
    dispatch(addButtonNames(id));
  }
  return (
    <ul className='flex flex-col gap-3 p-2'>
      {bottom_buttons && bottom_buttons.map((button) => {
        return <li key={button.id}
          onClick={() => handleLeftButtonClick(button.id)}
          className=" flex gap-2 items-center border border-black p-1 rounded-2xl bg-white text-md cursor-pointer hover:bg-gray-400">
          {button.icon} <span>{button.name}</span>
        </li>
      })}
    </ul>
  )
}

export default BottonConfigButtons