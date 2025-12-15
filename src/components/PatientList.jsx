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
import { charAtIndex } from "pdf-lib";


const PatientList = ({ filterPatient, bottom_button }) => {
  const auth = useSelector((state) => state.auth.value);
  const { user_id } = auth || {};
  const { value: patientsList, loading: deleteLoader, error } = useSelector((state) => state.patientnames);
  const { loading } = useSelector((state) => state.askQ);

  console.log("patients list from store", patientsList);
  const dispatch = useDispatch();
  const [openIndex, setOpenIndex] = useState(null);
  const [openName, setOpenName] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getPatients();
        console.log("patients list", res.data);
        const { data: patientsList, pcc_data } = res;
        const filteredPatients = (patientsList || []).map((p) => ({
          type: "data",
          name: p.name,
          raw: p,
        }));
        console.log("Filtered Patients List from DATA:", filteredPatients);
        const pccDetails = (pcc_data && pcc_data.details) || {};
        const filteredPcc = Object.entries(pccDetails)
          .map(([name, detailsArray]) => ({
            type: "pcc",
            name,
            details: detailsArray,
            raw: { patient_type: pcc_data.patient_type || "PCC" },
          }));

        const merged = [...filteredPatients, ...filteredPcc];

        dispatch(addPatientNames(merged));
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

  const handlePatientDelete = (e, patient_name, patient_type, dataType) => {
    e.stopPropagation();
    console.log("Deleting patient:", patient_name, patient_type);
    if (patient_name && patient_type) {
      dispatch(deletePatientThunk({ patient_type, patient_name, dataType }));
    }
  }

  // if (loading || deleteLoader) return <Spinner />;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white rounded  h-full grid grid-rows-[1fr_1fr] min-h-0 ">
      <ul className="overflow-y-auto min-h-0 bg-white">
        {filterPatient.length === 0 && (
          <li className="p-3 text-gray-500">No patients found</li>
        )}

        {filterPatient.map((item, idx) => {
          const isOpen = openName === item.name;
          const key = `${item.type}-${item.name}-${idx}`;

          if (item.type === "data") {
            const patient = item.raw;
            return (
              <div key={key}>
                <li
                  onClick={() => setOpenName(isOpen ? null : item.name)}
                  className={`flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-gray-200`}
                >
                  <FaUser />
                  {item.name}
                </li>

                {isOpen && patient.data && (
                  <ul className="transition-all duration-700">
                    {patient.data.map((date) => (
                      <li
                        onClick={() => handlePatientClick(date)}
                        key={`${date.dates}-${date.lancedb_table}`}
                        className={`${loading || deleteLoader ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-300"} flex items-center justify-between gap-2 py-2 px-2 mb-1 bg-gray-200`}
                      >
                        <span>{date.dates}</span>
                        <span
                          className={`${loading || deleteLoader ? "cursor-not-allowed opacity-50" : "hover:bg-white hover:text-red-600"} bg-red-500 text-gray-900 p-1 rounded-full`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientDelete(e, date.patient_name, date.patient_type, item.type);
                          }}
                        >
                          <MdDelete />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          } else if (item.type === "pcc") {
            return (
              <div key={key}>
                <li
                  onClick={() => setOpenName(isOpen ? null : item.name)}
                  className={`flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-gray-200`}
                >
                  <FaUser />
                  <span>{item.name}</span>
                  {/* <small className="ml-2 text-xs text-gray-500">({item.raw.patient_type})</small> */}
                </li>

                {isOpen && (
                  <ul className="transition-all duration-500 p-2 bg-gray-50">
                    {item.details && item.details.length > 0 ? (
                      item.details.map((detail, i) => (
                        <li key={`${item.name}-detail-${i}`} className="py-1 px-2 text-sm cursor-pointer hover:bg-gray-200">
                          • {detail.charAt(0).toUpperCase() + detail.slice(1)}
                        </li>
                      ))
                    ) : (
                      <li className="py-1 px-2 text-sm text-gray-500">No PCC details</li>
                    )}
                  </ul>
                )}
              </div>
            );
          }

          return null;
        })}
      </ul>
      <BottonConfigButtons />
    </div>
  );
};

export default React.memo(PatientList);
// export default PatientList;
