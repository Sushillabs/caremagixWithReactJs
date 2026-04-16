import AskQuestion from "./AskQuestion"
import { useDispatch, useSelector } from "react-redux"
import { Spinner } from "./Spiner";
import useMyMutation from "../hooks/useMyMutation";
import { dischargePlan } from '../api/hospitalApi';
import { useRef, useEffect, useState, memo } from "react";
import ReviewModal from "./ReviewModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const Notes = () => {
  const { activeTemplate, firstQ, pendingChat, notes_chat, template } = useSelector((state) => state.notes);
  console.log()
  const file_path = template?.data?.pdf_path;
  const isEmailSent = template?.data?.email_status === 'Email sent successfully.';
  const bottom_button = useSelector((state) => state.buttonNames.value);
  console.log('notes_chat', notes_chat)
  const bottomRef = useRef(null);
  const [isReviewed, setIsReviewd] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleReview = () => {
    // setIsReviewd(true);
    setShowReview(true)
  }

  const handleDownload=()=>{

    console.log('file_path', file_path);
    if(file_path){
      window.open(file_path, '_blank');
    }
    
  }


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pendingChat, notes_chat, template.error, isReviewed])

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


        {notes_chat && (notes_chat.map((chat) => {
          const isReviewStep = chat.question === "All sections complete! Shall I generate the final visit note now? (yes/no)";

          return (<div key={chat.id} className="mb-4">
            {/* Answer */}
            <div className="text-xs sm:text-sm overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2">
              {chat.answer}
            </div>
            {/* Review Button */}
            {isReviewStep && (
              <button
                className={`p-2 mb-2  ${isReviewed ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'bg-blue-500 text-white hover:cursor-pointer hover:bg-blue-600'} rounded-md`}
                onClick={handleReview}
                disabled={isReviewed}
              >
                {isReviewed ? 'Reviewed' : 'Review'}
              </button>)
            }
            {/* Question */}
            {chat.final_template && <div className="flex gap-2 sm:mb-2 mb-1">
              <img
                src="images/favicon/android-chrome-192x192.png"
                alt="App Icon"
                className="w-8 h-6 sm:w-12 sm:h-12 border border-gray-500 object-contain rounded-lg"
              />
              <span className="text-xs sm:text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chat.final_template}
                </ReactMarkdown>
              </span>
            </div>}
            {chat?.isDownload && (
              <button
                className={`p-2 mb-2 bg-blue-500 hover:cursor-pointer hover:bg-blue-600 rounded-md text-white`}
                onClick={handleDownload}
              >
                Download
              </button>)
            }
            {(!isReviewStep || isReviewed) && <div className="flex items-center gap-2 sm:mb-2 mb-1">
              <img
                src="images/favicon/android-chrome-192x192.png"
                alt="App Icon"
                className="w-8 h-6 sm:w-12 sm:h-12 border border-gray-500 object-contain rounded-lg"
              />
              <span className="text-xs sm:text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {`${chat?.isEmailDone ? '✅ ' : ''}${chat.question}`}
                </ReactMarkdown>
              </span>
            </div>}

          </div>)
        }))}

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
      {bottom_button === 'create-visit-notes' && template.data && !isEmailSent &&<AskQuestion />}
      {showReview && (
        <ReviewModal
          template={activeTemplate?.template}
          onClose={() => setShowReview(false)}
          setIsReviewd={setIsReviewd}
        />
      )}
    </div>
  )
}

export default Notes