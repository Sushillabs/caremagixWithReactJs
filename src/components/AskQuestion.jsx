import { FaMicrophone, FaArrowUp } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { useState } from "react";
import useAskQuestion from "../hooks/useAskQuestion";
import React from "react";
const AskQuestion = () => {
  const [inputValue, setInputValue] = useState('');
  const { askQuestion, isPending } = useAskQuestion();
  // const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

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

  const handleAskSubmit = () => {
    if (inputValue.trim() === '') return;
    askQuestion(inputValue);
    setInputValue('');
  }
  return (
    <div className="sm:bg-white sm:mt-4 sm:p-2 grid grid-cols-12 items-center sm:gap-6 border border-gray-300 rounded ">
      <div className=" bg-white border border-gray-300 rounded col-span-12 sm:col-span-12 flex items-center sm:gap-2 sm:p-2">
        <textarea
          placeholder="Ask a question ..."
          className="sm:p-2 h-auto w-full"
          aria-label="Ask a question"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
