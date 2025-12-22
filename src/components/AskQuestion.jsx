import { FaMicrophone } from "react-icons/fa";
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
    setIsListening(true);
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
    <div className="sm:bg-white mt-4 sm:p-2 grid grid-cols-12 items-center gap-6 border border-gray-300 rounded ">
      <div className=" bg-white border border-gray-300 rounded col-span-12 sm:col-span-10 flex items-center gap-2 p-2">
        <textarea
          placeholder="Ask a question ..."
          className="p-2 h-auto w-full"
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
          className="disabled:opacity-45 rounded-2xl border h-min text-red-500 p-1 cursor-pointer  hover:text-black hover:bg-gray-200"
        >
          clear
        </button>
        <button
          type="button"
          className="disabled:opacity-45 rounded-full p-4 border cursor-pointer hover:text-blue-700"
          disabled={isListening || isPending}
          onClick={startListening}
          aria-label="Start voice input"
        >
          <FaMicrophone />
        </button>
      </div>
      <button
        className="bg-none disabled:opacity-45 bg-green-600 text-white rounded-2xl h-min p-2 text-center sm:col-span-2 w-30 cursor-pointer hover:bg-green-800"
        type="submit"
        onClick={handleAskSubmit}
        disabled={isPending}
        aria-label="Submit question"
      >
        Submit
      </button>
    </div>
  );
};

export default React.memo(AskQuestion);
