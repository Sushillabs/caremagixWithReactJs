import { FaMicrophone } from "react-icons/fa";
import { useState } from "react";
import useAskQuestion from "../hooks/useAskQuestion";
import React from "react";
const AskQuestion = () => {
  const [inputValue, setInputValue] = useState('');
  const { askQuestion, isPending } = useAskQuestion();
  console.log('isPending', isPending);

  const handleAskSubmit = () => {
    if (inputValue.trim() === '') return;
    askQuestion(inputValue);
    setInputValue('');
  }
  return (
    <div className="bg-white h-[15vh] ml-4 mt-4 p-2 grid grid-cols-12 items-center gap-6 ">
      <div className="border border-gray-300 rounded col-span-10 flex items-center gap-2 p-2">
        <textarea
          placeholder="Ask a question ..."
          className="p-2 h-full w-full"
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
          disabled={true}
          aria-label="Start voice input"
        >
          <FaMicrophone />
        </button>
      </div>
      <button
        className="disabled:opacity-45 bg-green-600 text-white rounded-2xl h-min p-2 text-center col-span-2 w-30 cursor-pointer hover:bg-green-800"
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
