import { useCallback, useState, useEffect } from "react";

import CareHeader from "../components/CareHeader";
import SearchInput from "../components/SearchInput";
import PatientList from "../components/PatientList";
import Chat from "../components/Chat";
import AskQuestion from "../components/AskQuestion";
import { useDispatch, useSelector } from "react-redux";
// import { addPatientNames } from "../redux/patientListSlice";
import debounce from "lodash.debounce";

function CareGiver() {
  const patientsList = useSelector((state) => state?.patientnames?.value);
  console.log("patients list from store", patientsList);
  //  const dispatch = useDispatch();
  const [filterName, setFilterName] = useState("");
   const [inputValue, setInputValue] = useState('');

  const debouncedSetFilterName = useCallback(
    debounce((value) => {
      setFilterName(value);
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetFilterName.cancel();
    };
  }, [debouncedSetFilterName]);

  const handleInputChange = (value) => {
    setInputValue(value); // Immediate display
    debouncedSetFilterName(value); // Debounced filtering
  };
  const filterPatient = patientsList.filter((patient) => {
    return patient?.name
      .toLowerCase()
      .includes(filterName.trim().toLowerCase());
  });
  console.log("searching", filterPatient);
  return (
    <div>
      <CareHeader />
      <div className="grid grid-cols-12 bg-caregiverbg pl-4 pr-4 h-[87vh]">
        <div className="col-span-2 ">
          <SearchInput
            placeholder="Search Patient Name ..."
            value={inputValue}
            onChange={handleInputChange}
          />
          <PatientList filterPatient={filterPatient} />
        </div>
        <div className="col-span-10">
          <Chat />
          <AskQuestion />
        </div>
      </div>
    </div>
  );
}

export default CareGiver;
