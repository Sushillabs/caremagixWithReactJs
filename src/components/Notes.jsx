import AskQuestion from "./AskQuestion"
import { useDispatch, useSelector } from "react-redux"
import { Spinner } from "./Spiner";
import useMyMutation from "../hooks/useMyMutation";
import { dischargePlan } from '../api/hospitalApi';
import { useRef, useEffect } from "react";

const Notes = () => {
  const { activeTemplate, firstQ, pendingChat, notes_chat, template } = useSelector((state) => state.notes);
  const bottom_button = useSelector((state) => state.buttonNames.value);
  console.log('notes_chat', notes_chat)
  const bottomRef = useRef(null);

  // const {
  //   data: notes_data,
  //   error: notes_error,
  //   isError: notes_isError,
  //   isPending: notes_isPending,
  //   isFetching: notes_isFetching,
  //   mutate: notes_mutate,
  //   mutateAsync: notes_mutateAsync
  // } = useMyMutation({ api: dischargePlan, toastId: 'dischargePlan' })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pendingChat, notes_chat, template.error])

  // if (template.loading) return <Spinner />
  return (
    <div className="h-full grid grid-rows-[1fr_auto] min-h-0">
      {bottom_button !== 'create-visit-notes' && !firstQ && (
        <p className="text-gray-500 text-xl text-center font-bold flex items-center justify-center h-full">
          <span className="hidden sm:block">
            Please click on-Create visit Notes
          </span>
          <span className="sm:hidden text-xs">
            Please click on-Create visit Notes from the Menu above
          </span>
        </p>
      )}
      {/* {bottom_button === 'create-visit-notes' && template.error && (
        <p className="text-red-500 text-xl text-center font-bold flex items-center justify-center h-full">
          <span className="">
            Data Not Found
          </span>
        </p>
      )} */}
      {bottom_button === 'create-visit-notes' && template.data && <div className="overflow-y-auto">
        {/* {notes_chat.length === 0 ? ( */}
        <div className="flex items-center gap-2 sm:mb-2 mb-1">
          <img
            src="images/favicon/android-chrome-192x192.png"
            alt="App Icon"
            className="w-8 h-6 sm:w-12 sm:h-12 border border-gray-500 object-contain rounded-lg"
          />
          <span className="text-xs sm:text-sm">
            {firstQ}
          </span>
        </div>


        {notes_chat && (notes_chat.map((chat) => (
          <div key={chat.id} className="mb-4">

            {/* Answer */}
            <div className="text-xs sm:text-sm overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2">
              {chat.answer}
            </div>

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

          </div>
        )))}

        {pendingChat && <div className="text-xs sm:text-sm overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2">
          {pendingChat.answer}
        </div>}
        {template.error && <div className="text-xs sm:text-sm overflow-x-auto text-red-400 border border-red-400 rounded p-2 bg-red-100 mb-2">
          {template.error || 'Somthing went wrong, Please try again'}
        </div>}
        {template.loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-3 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>}
      {bottom_button === 'create-visit-notes' && template.data && <AskQuestion />}
    </div>
  )
}

export default Notes