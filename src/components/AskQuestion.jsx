import { Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useAskQuestion from "../hooks/useAskQuestion";
import { addInputAns, addLocalTurn } from "../redux/notesSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dischargePlan } from '../api/hospitalApi';
// import { addTemplate } from "../redux/notesSlice";
import useMyMutation from "../hooks/useMyMutation";
import { fetchDischargePlan } from "../redux/notesSlice";


const AskQuestion = ({ isVisitNotes = false }) => {
  const [inputValue, setInputValue] = useState('');
  const { askQuestion, isPending } = useAskQuestion();
  const dispatch = useDispatch();
  const bottom_button = useSelector((state) => state.buttonNames.value);
  // const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [awaitingMoreInfo, setAwaitingMoreInfo] = useState(false);
  const inputRef=useRef()

  const prettifyField = (field) => (field || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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


  const isVisitNotesMode = isVisitNotes || tab_name === 'create-notes';

  const handleAskSubmit = async () => {
    if (inputValue.trim() === '') return;

    if (!isVisitNotesMode) {
      askQuestion(inputValue);
    }

    if (isVisitNotesMode) {
      const { current_field, template, awaiting_confirmation = false, next_field, next_question } = activeTemplate || {};
      const isSavePlan = next_question === 'Discharge plan is complete! Would you like to save or download it?'
      const isYes = inputValue.trim().toLowerCase().startsWith('y');
      const isConfirmStep = current_field && awaiting_confirmation && !awaitingMoreInfo;

      // Field confirmation step ("Ready to fill out X? yes/no") — the backend trusts
      // user_confirmation blindly, so "no" must be handled client-side, same as the
      // legacy app: stay on the field and let the user add more instead of advancing.
      if (isConfirmStep && !isYes) {
        dispatch(addLocalTurn({
          answer: inputValue,
          question: `Okay, what else would you like to add for the **${prettifyField(current_field)}** section? If you're ready to move on to **${prettifyField(next_field)}**, please say "Yes."`,
        }));
        setAwaitingMoreInfo(true);
        setInputValue('');
        return;
      }

      // Save confirmation step ("...save or download it?") — same issue: save_plan
      // saves unconditionally whenever called, so "no" must stop it client-side.
      if (isSavePlan && !current_field && !isYes) {
        dispatch(addLocalTurn({
          answer: inputValue,
          question: 'Okay, this visit note will not be saved.',
        }));
        setInputValue('');
        return;
      }

      dispatch(addInputAns(inputValue))

      let payload;

      //process_response
      if (current_field) {
        if (isConfirmStep) {
          // Yes to the confirmation prompt
          payload = {
            action: "process_response",
            patient_name: patientData.patient_name,
            patient_type: patientData.patient_type,
            field: current_field,
            response: template[current_field],
            template: template,
            user_confirmation: true,
          };
        } else {
          // when Ans to Q (also covers the "no, here's more info" follow-up)
          // template is echoed back exactly as last received from the backend —
          // the backend is the sole authority on template[field], derived from
          // its own chat history at COMPLETE, same as the legacy app does.
          payload = {
            action: "process_response",
            patient_name: patientData.patient_name,
            patient_type: patientData.patient_type,
            field: current_field,
            response: inputValue,
            template: template,
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

      console.log('visit payload', payload)
      setAwaitingMoreInfo(false);
      setInputValue('');
      dispatch(fetchDischargePlan(payload))

    }
  }

  useEffect(() => {
    setAwaitingMoreInfo(false);
  }, [activeTemplate?.current_field])

  useEffect(()=>{
    if(inputRef.current){
      inputRef.current.focus();
    }   
  },[activeTemplate])

  return (
    <div className="border-t border-gray-200 bg-white px-5 py-3">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        <input
          type="text"
          placeholder="Ask a question ..."
          className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
          aria-label="Ask a question"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isPending}
          ref={inputRef}
        />
        <button
          type="button"
          className={`text-gray-400 hover:text-gray-600 disabled:opacity-40 ${isListening ? 'text-emerald-600' : ''}`}
          disabled={isListening || isPending}
          onClick={startListening}
          aria-label="Start voice input"
        >
          <Mic size={18} />
        </button>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
          onClick={handleAskSubmit}
          disabled={isPending}
          aria-label="Submit question"
        >
          <Send size={14} />
          {isPending ? '...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};
export default React.memo(AskQuestion);
