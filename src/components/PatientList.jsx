import React, { useEffect, useState } from "react";
import { getPatients } from "../api/hospitalApi";
import { useDispatch, useSelector } from "react-redux";
import { addPatientNames } from "../redux/patientListSlice";
import { deleteQconversation } from "../redux/chatSlice";
import { addDischargePatientDate } from "../redux/PatientSingleDateSlice";
import { FaUser, FaRegStickyNote } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import BottonConfigButtons from "./BottonConfigButtons";

const PatientList = ({filterPatient}) => {
  const auth = useSelector((state) => state.auth.value);
  const { user_id } = auth || {};
  const patientsList = useSelector((state) => state.patientnames.value);

  console.log("patients list from store", patientsList);
  const dispatch = useDispatch();
  const [openIndex, setOpenIndex]=useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getPatients();
        console.log("patients list", res.data);
        dispatch(addPatientNames(res.data));
      } catch (error) {
        console.error("Error while fetching the patient list", error);
      }
    };
    fetchPatient();
    //  console.log("patients list from store", patientsList);
  }, []);

  useEffect(() => {
    console.log("patients list updated", patientsList);
  }, [patientsList]);

  const handlePatientClick=(date)=>{
    dispatch(deleteQconversation())
    const payload={...date,  patient_type:"Discharged", user_id:user_id}
    dispatch(addDischargePatientDate(payload))
  }
  const handlePatientDelete=()=>{

  }
  return (
    <div className="h-[76vh] bg-white rounded mt-2">
      <ul className="h-[38vh] overflow-auto">
        {filterPatient &&
          filterPatient.map((patient, ind) => (
            <div>
              <li
                onClick={() => setOpenIndex(openIndex === ind ? null : ind)}
                key={ind}
                className={`flex items-center gap-2 py-2 px-2 mb-1 bg-blue-200 cursor-pointer hover:bg-blue-300`}
              >
                <FaUser />
                {patient.name}
              </li>

              {openIndex === ind && patient.data && (
                <ul className="transition-all duration-700">
                  {patient.data.map((date, ind) => (
                    <li
                      onClick={()=>handlePatientClick(date)}
                      key={ind}
                      className={`flex items-center justify-between gap-2 py-2 px-2 mb-1 bg-gray-200 cursor-pointer hover:bg-gray-300`}
                    >
                      {date.dates}
                      <span 
                      className="bg-red-500 text-gray-900 p-1 rounded-full hover:bg-white hover:text-red-600"
                      onClick={handlePatientDelete}
                      >
                        <MdDelete />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </ul>
      {/* < div className="h-[36vh]"> */}
          <BottonConfigButtons className="h-[38vh]"/>
      {/* </div> */}
    </div>
  );
};

export default PatientList;
