import React, { useEffect, useState } from "react";
import { getPatients } from "../api/hospitalApi";
import { useDispatch, useSelector } from "react-redux";
import { addPatientNames, deletePatientThunk } from "../redux/patientListSlice";
// import { clearChat} from "../redux/chatSlice";
import { addDischargePatientDate } from "../redux/PatientSingleDateSlice";
import { FaUser, FaRegStickyNote } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import BottonConfigButtons from "./BottonConfigButtons";
import { fetchPatientChat, clearChat, addQconversation } from '../redux/chatSlice';
import { Spinner } from "./Spiner";


const PatientList = ({ filterPatient ,bottom_button}) => {
  const auth = useSelector((state) => state.auth.value);
  const { user_id } = auth || {};
  const { value: patientsList, loading: deleteLoader, error } = useSelector((state) => state.patientnames);
  const { loading } = useSelector((state) => state.askQ);

  console.log("patients list from store", patientsList);
  const dispatch = useDispatch();
  const [openIndex, setOpenIndex] = useState(null);

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
  }, [bottom_button]);

  const handlePatientClick = (date) => {
    dispatch(clearChat())
    const payload = { ...date, patient_type: "Discharged", user_id: user_id }
    dispatch(addDischargePatientDate(payload))
    dispatch(fetchPatientChat(payload));
    console.log("handlePatient called")
  }

  const handlePatientDelete = (e, name, dateId) => {
    e.stopPropagation();
    console.log("Deleting patient:", name, dateId);
    if (name && dateId) {
      dispatch(deletePatientThunk({ patient_type: "Discharged", patient_name: name, dateId }));
    }
  }

  // if (loading || deleteLoader) return <Spinner />;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="h-[76vh] bg-white rounded mt-2">
      <ul className="h-[38vh] overflow-auto bg-gray-100">
        {filterPatient &&
          filterPatient.map((patient, ind) => (
            patient.data && patient.data.length !== 0 && (<div>
              <li
                onClick={() => setOpenIndex(openIndex === ind ? null : ind)}
                key={ind}
                className={`flex items-center gap-2 py-2 px-2 mb-1 bg-white cursor-pointer hover:bg-blue-200`}
              >
                <FaUser />
                {patient.name}
              </li>

              {openIndex === ind && patient.data && (
                <ul className="transition-all duration-700">
                  {patient.data.map((date) => (
                    <li
                      onClick={() => handlePatientClick(date)}
                      key={date.dates}

                      className={`${loading || deleteLoader ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-300'} flex items-center justify-between gap-2 py-2 px-2 mb-1 bg-gray-200 `}
                    >
                      {date.dates}
                      <span
                        className={`${loading || deleteLoader? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:text-red-600'} bg-red-500 text-gray-900 p-1 rounded-full `}
                        onClick={(e) => handlePatientDelete(e, patient.name, date.dates)}
                      >
                        <MdDelete />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>)
          ))}
      </ul>
      <BottonConfigButtons className="" />
    </div>
  );
};

export default React.memo(PatientList);
// export default PatientList;
