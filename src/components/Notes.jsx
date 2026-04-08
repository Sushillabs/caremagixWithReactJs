import AskQuestion from "./AskQuestion"
import { useDispatch, useSelector } from "react-redux"
import { Spinner } from "./Spiner";
import useMyMutation from "../hooks/useMyMutation";
// import { dischargePlan } from '../api/hospitalApi';

const Notes = () => {
  const get_template = useSelector((state) => state.notes.activeTemplate);
  const bottom_button = useSelector((state) => state.buttonNames.value);
  const notes_chat = useSelector((state) => state.notes.notes_chat)
  console.log('notes_chat', notes_chat)


  // if (!get_template) return <Spinner />
  return (
    <div className="h-full grid grid-rows-[1fr_auto] min-h-0">
      {bottom_button !== 'create-visit-notes' && !get_template && (
        <p className="text-gray-500 text-xl text-center font-bold flex items-center justify-center h-full">
          <span className="hidden sm:block">
            Please click on-Create visit Notes
          </span>
          <span className="sm:hidden text-xs">
            Please click on-Create visit Notes from the Menu above
          </span>
        </p>
      )}
      {bottom_button === 'create-visit-notes' && !get_template && (
        <p className="text-red-500 text-xl text-center font-bold flex items-center justify-center h-full">
          <span className="">
            Data Not Found
          </span>
        </p>
      )}
      {bottom_button === 'create-visit-notes' && get_template && <div className="overflow-y-auto">
        {notes_chat.length === 0 ? (
          <div className="flex items-center gap-2 sm:mb-2 mb-1">
            <img
              src="images/favicon/android-chrome-192x192.png"
              alt="App Icon"
              className="w-8 h-6 sm:w-12 sm:h-12 border border-gray-500 object-contain rounded-lg"
            />
            <span className="text-xs sm:text-sm">
              {get_template?.next_question}
            </span>
          </div>
        ) : (notes_chat.map((chat) => (
          <div key={chat.id} className="mb-4">

            {/* Question */}
            <div className="flex items-center gap-2 sm:mb-2 mb-1">
              <img
                src="images/favicon/android-chrome-192x192.png"
                alt="App Icon"
                className="w-8 h-6 sm:w-12 sm:h-12 border border-gray-500 object-contain rounded-lg"
              />
              <span className="text-xs sm:text-sm">
                {chat.question}
              </span>
            </div>

            {/* Answer */}
            <div className="text-xs sm:text-sm overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2">
              {chat.answer}
            </div>

          </div>
        )))}
      </div>}
      {bottom_button === 'create-visit-notes' && get_template && <AskQuestion />}
    </div>
  )
}

export default Notes