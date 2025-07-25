import React from 'react'
import { MdCreate, MdDelete } from "react-icons/md";
import { FaUser, FaRegStickyNote, FaUpload } from "react-icons/fa";
import { GrConfigure } from "react-icons/gr";

const BottonConfigButtons = () => {
    let bottom_buttons = [
      { name: "Create Progress Notes", icon: <MdCreate /> },
      { name: "AI Agent", icon: <FaUser /> },
      { name: "eFax Configuration", icon: <GrConfigure /> },
      { name: "Upload Patients Plan", icon: <FaUpload /> },
      { name: "Clear Conversations", icon: <MdDelete /> },
    ];
  return (
    <ul className='flex flex-col gap-3 p-2'>
        {bottom_buttons && bottom_buttons.map((button, ind)=>(
            <li key={ind} className=" flex gap-2 items-center border border-black p-1 rounded-2xl bg-white text-md cursor-pointer hover:bg-gray-400">
               {button.icon} <span>{button.name}</span>
            </li>
        ))}
    </ul>
  )
}

export default BottonConfigButtons