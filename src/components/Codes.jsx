import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPatientNames, deletePatientThunk } from "../redux/patientListSlice";
import { addDischargePatientDate } from "../redux/PatientSingleDateSlice";
import { LuClipboardPlus } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { fetchPatientChat, clearChat, addQconversation } from '../redux/chatSlice';
import { useQueryClient } from "@tanstack/react-query";



const Codes = () => {
  const queryClient = useQueryClient();
  const { value: auth, item } = useSelector((state) => state.auth);
  const { id: headerId, name: headerName } = item;
  const { user_id } = auth || {};
  const { loading } = useSelector((state) => state.askQ);
  const { icd_value, cpt_value } = useSelector((state) => state.codes)

  let codes_data = [];
  if (headerId === 'icd_codes') {
    codes_data = icd_value
  }
  if (headerId === 'cpt_codes') {
    codes_data = cpt_value
  }
  console.log('codes_Data', codes_data)
  const dispatch = useDispatch();
  const [openName, setOpenName] = useState(null);

  const handlePatientClick = (id, item) => {
    dispatch(clearChat())
    //make two paload based on type
    console.log('iitwm', item);
    let payload = {};
    if (item.type === "data") {
      payload = { ...id, user_id: user_id, patient: item }
    }

    dispatch(addDischargePatientDate(payload))
    dispatch(fetchPatientChat(payload));
    console.log("handlePatient called payload:", payload);
  }

  const handlePatientDelete = (e, patient_name, patient_type, dataType, patient_date) => {
    e.stopPropagation();
    console.log("Deleting patient:", patient_name, patient_type);
    if (patient_name && patient_type) {
      dispatch(deletePatientThunk({ patient_type, patient_name, dataType, patient_date }));
    }
  }
  const isFetching = queryClient.isFetching({ queryKey: ['icd'] }) > 0 || queryClient.isFetching({ queryKey: ['cpt'] }) > 0;
  // if (isFetching) return <Spinner />;
  //   if (error) return <p className="text-red-600">Error: </p>;

  return (
    <div className="bg-white">
      <ul >
        {isFetching && (
          <p className={`py-2 px-2 mb-1 text-gray-400`}>Loading ...</p>
        )}
        {!isFetching && codes_data.length === 0 && (
          <li className={`hover:bg-gray-300 flex justify-center cursor-pointer py-2 mb-1 text-red-500 text-sm`}>Not Found</li>
        )}

        {!isFetching && codes_data.map((item, idx) => {
          const isOpen = openName === item.name;
          const key = `${item.type}-${item.name}-${idx}`;

          if (item.type === "data") {
            const patient = item.raw;
            return (
              <div key={key}>
                <li
                  onClick={() => setOpenName(isOpen ? null : item.name)}
                  className={`hover:bg-gray-300 flex items-center gap-2 py-2 px-2 cursor-pointer mb-1`}
                >
                  <LuClipboardPlus />
                  {item.name}
                </li>

                {isOpen && patient.data && (
                  <ul className="transition-all duration-700">
                    {patient.data.map((date) => (
                      <li
                        onClick={() => handlePatientClick(date, item)}
                        key={`${date.dates}-${date.lancedb_table}`}
                        className={`${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-200"} flex items-center justify-between gap-2 py-2 px-2 mb-1 bg-gray-100`}
                      >
                        <span>{date.dates}</span>
                        <span
                          className={`${loading ? "cursor-not-allowed opacity-50" : "hover:bg-white hover:text-red-600"} bg-red-500 text-gray-900 p-1 rounded-full`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientDelete(e, date.patient_name, date.patient_type, item.type, date.dates);
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
          }

          return null;
        })}
      </ul>
    </div>
  );
};

export default React.memo(Codes);
// export default PatientList;
