import { FaMicrophone, FaArrowUp } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";
import useAskQuestion from "../hooks/useAskQuestion";
import { addInputAns } from "../redux/notesSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dischargePlan } from '../api/hospitalApi';
// import { addTemplate } from "../redux/notesSlice";
import useMyMutation from "../hooks/useMyMutation";
import { fetchDischargePlan } from "../redux/notesSlice";


const AskQuestion = () => {
  const [inputValue, setInputValue] = useState('');
  const { askQuestion, isPending } = useAskQuestion();
  const dispatch = useDispatch();
  const bottom_button = useSelector((state) => state.buttonNames.value);
  // const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef=useRef()

  const {activeTemplate, final_template} = useSelector((state) => state.notes);
  const patientData = useSelector((state) => state?.patientsingledata?.value);
  const tab_name=useSelector((state)=>state.tab.value);

  const { mutateAsync } = useMyMutation({
    api: dischargePlan,
    toastId: 'dischargePlan'
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  const startListening = () => {
    setIsListening(!isListening);
    recognition.start();
  };

  recognition.onresult = (event) => {
    setInputValue(event.results[0][0].transcript);
  };

  recognition.onend = () => setIsListening(false);

  recognition.onerror = () => setIsListening(false);
  console.log('isPending', isPending);


  const isValidEmailFormate = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAskSubmit = async () => {
    if (inputValue.trim() === '') return;

    if (tab_name !== 'create-notes') {
      askQuestion(inputValue);
    }

    if (tab_name === 'create-notes') {
      dispatch(addInputAns(inputValue))
      const { current_field, template, awaiting_confirmation = false, next_question, message } = activeTemplate || {};
      const isSavePlan = next_question === 'Discharge plan is complete! Would you like to save or download it?'
      const isEmailSend = message === 'Visit Note saved successfully.'

      let payload;

      //process_response
      if (current_field) {
        if (awaiting_confirmation) {
          // When choosing Y or N         
          payload = {
            action: "process_response",
            patient_name: patientData.patient_name,
            patient_type: patientData.patient_type,
            field: current_field,
            response: template[current_field],
            template: template,
            user_confirmation: awaiting_confirmation,
          };
        } else {
          // when Ans to Q 
          const updatedTemplate = {
            ...template,
            [current_field]: inputValue,
          };
          payload = {
            action: "process_response",
            patient_name: patientData.patient_name,
            patient_type: patientData.patient_type,
            field: current_field,
            response: inputValue,
            template: updatedTemplate,

          };
        }
      }

      // save_plan
      if (isSavePlan && !current_field) {
        payload = {
          action: 'save_plan',
          final_template: final_template,
          patient_name: patientData.patient_name,
          patient_type: patientData.patient_type,
        }
      }

      if (isEmailSend && !current_field) {
        let isEmailOk = isValidEmailFormate(inputValue);
        if (!isEmailOk) {
          toast.error("⚠️ Enter the vaild Email", {
            position: "top-center",
          });
          return;
        }
        payload = {
          action: 'save_plan',
          final_template: final_template,
          patient_name: patientData.patient_name,
          patient_type: patientData.patient_type,
          send_email: true,
          recipient_email: isEmailOk ? inputValue : null,
        }
      }


      console.log('visit payload', payload)
      setInputValue('');
      dispatch(fetchDischargePlan(payload))

    }
  }

  useEffect(()=>{
    if(inputRef.current){
      inputRef.current.focus();
    }   
  },[activeTemplate])

  return (
    <div className="sm:bg-white sm:mt-4 sm:p-2 grid grid-cols-12 items-center sm:gap-6 border border-gray-300 rounded ">
      <div className=" bg-white border border-gray-300 rounded col-span-12 sm:col-span-12 flex items-center sm:gap-2 sm:p-2">
        <textarea
          placeholder="Ask a question ..."
          className="sm:p-2 h-auto w-full"
          aria-label="Ask a question"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          ref={inputRef}
        // disabled={true}
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => setInputValue('')}
          aria-label="Clear input"
          className=" hidden sm:block disabled:opacity-45 text-red-500 sm:text-xl text-md cursor-pointer  hover:text-black hover:bg-gray-200"
        >
          <CiCircleRemove />
        </button>
        <button
          type="button"
          className={`disabled:opacity-45 sm:p-4 p-1 hover:text-blue-700 ${isListening ? 'text-blue-700' : ''}`}
          disabled={isListening || isPending}
          onClick={startListening}
          aria-label="Start voice input"
        >
          <FaMicrophone />
        </button>
        <button
          className="bg-none disabled:opacity-45 text-green-600 rounded-full border sm:p-2 p-1 text-center sm:col-span-2 cursor-pointer"
          type="submit"
          onClick={handleAskSubmit}
          disabled={isPending}
          aria-label="Submit question">
          <FaArrowUp />
        </button>
      </div>

    </div>
  );
};
export default React.memo(AskQuestion);
