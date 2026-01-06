import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getPatientChat, askAPI, getDocRef } from "../api/hospitalApi";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { addQconversation } from "../redux/chatSlice";
// import { fetchPatientChat, clearChat, addQconversation } from '../redux/chatSlice';
import { FaPlus } from "react-icons/fa6";
import { Spinner } from "./Spiner";
// import { useMutation } from '@tanstack/react-query';
import useAskQuestion from "../hooks/useAskQuestion";
import useDocRef from "../hooks/useDocRef";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DocRefModal from "./DocRefModal";
import AskQuestion from "./AskQuestion";


const Chat = () => {
  const MySwal = withReactContent(Swal);
  const { fetchDocRef } = useDocRef();
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const get_conversation = useSelector((state) => state?.askQ?.value);
  const { data: chatData, loading, isAskPending, error: ERROR } = useSelector((state) => state.askQ);
  console.log('chatData', chatData)
  console.log("getConversation", get_conversation);
  const dispatch = useDispatch();
  console.log("singleDate 111→", singleDate);
  const { askQuestion, isPending, error } = useAskQuestion();
  console.log('isPending in chat', isPending);

  const handleQuestionClick = (ind) => {
    const currentQuestion = chatData[ind];
    askQuestion(currentQuestion);
  }

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [get_conversation]);
  const quickLinksRef = useRef(null);

  const handleQuickLinksRef = () => {
    if (quickLinksRef.current) {
      console.log("Scrolling to Quick Links", quickLinksRef);
      quickLinksRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  const handleDocRef = async (answerId) => {
    const ansID = { question_id: answerId }
    try {
      const docResponse = await getDocRef(ansID);
      if (docResponse) {
        console.log("Doc Ref Response:", docResponse);
        // await fetchDocRef(docResponse);
        const resultSawal = await MySwal.fire({
          title: <strong>Document References</strong>,
          html: <DocRefModal entries={docResponse.entries} />,
          showCloseButton: true,
          showCancelButton: false,
        });
      }
    } catch (error) {
      console.error("Error fetching doc ref:", error);
    }
    // 
  }
  const introQuestion = chatData[0];
  const questionList = chatData.slice(1, 9);
  // console.log("Intro Question:", introQuestion);
  console.log("Question List:", questionList);


  if (loading || isAskPending) return <Spinner />;
  if (error || ERROR) return <p className="text-red-600">Error: {error || ERROR}</p>;

  return (
    <div className="h-full grid grid-rows-[1fr_auto] min-h-0">
      {chatData.length === 0 && (
        <p className="text-gray-500 text-xl font-bold flex items-center justify-center h-full">
          Please select a Patient or Upload.
        </p>
      )}
      {chatData.length > 0 && (
        <div className="overflow-y-auto ">
          {/* header question */}
          {chatData.length > 0 && get_conversation.length === 0 && (
            <div className=" flex items-center gap-2 mb-2">
              <img
                src="images/favicon/android-chrome-192x192.png"
                alt="App Icon"
                className="w-18 h-16 border border-gray-500 object-contain rounded-lg"
              />
              <span>
                Welcome!! {singleDate.patient_name.split(" ")[0]}'s discharge summary
              </span>
            </div>
          )}

          {/* index==0 */}
          {introQuestion && get_conversation.length === 0 && (
            <div className="overflow-x-auto border border-blue-300 rounded sm:p-2 bg-gray-100 ">
              <button
                className="bg-green-500 text-white rounded px-2 py-1 mb-1 cursor-pointer hover:bg-green-600"
                onClick={handleQuickLinksRef}
              >
                Discharge Quick Links
              </button>
              <ReactMarkdown
                children={introQuestion.replace(/\\n/g, "\n")}
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-blue-400 text-white text-left">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-white px-4 py-2 text-sm font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2 text-sm align-top whitespace-pre-line">
                      {children}
                    </td>
                  ),
                }}
              />
            </div>
          )}

          {get_conversation.length > 0 && (
            get_conversation.map((conversation, ind) => {
              let normalized =
                typeof conversation?.content === "string"
                  ? conversation.content.replace(/\\n/g, "\n")
                  : "";
              const content = (
                <ReactMarkdown
                  children={normalized}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ...(conversation.role === 'assistant' && {
                      table: ({ children }) => (
                        <table className="min-w-full table-auto border-collapse border border-gray-300">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-blue-500 text-white text-left">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-white px-4 py-2 text-sm font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className=" border border-gray-300 px-4 py-2 align-top text-sm text-gray-800 whitespace-pre-line">
                          {children}
                        </td>
                      ),
                    }),
                  }}
                />
              );

              if (conversation.role === 'assistant') {
                return (
                  <div
                    key={conversation.id}
                    className="overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2"
                  >
                    <button
                      className="bg-green-500 text-white rounded px-2 py-1 mb-1 mr-2 cursor-pointer hover:bg-green-600"
                      onClick={() => handleDocRef(conversation.id)}
                    >
                      Doc Ref
                    </button>
                    <button
                      className="bg-green-500 text-white rounded px-2 py-1 mb-1 cursor-pointer hover:bg-green-600"
                      onClick={handleQuickLinksRef}
                    >
                      Discharge Quick Links
                    </button>
                    {content}
                  </div>
                );

              }
              return <div className=" flex items-center space-y-2" key={ind} ref={ind === get_conversation.length - 2 ? chatEndRef : null}>
                <img
                  src="images/favicon/android-chrome-192x192.png"
                  alt="App Icon"
                  className="w-18 h-16 border border-gray-500 object-contain rounded-lg"
                />
                <span>
                  {conversation.content}
                </span>
              </div>
            })

          )}
          {/* Clickable questions */}
          {questionList.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" ref={quickLinksRef}>
              {questionList.map((question, index) => {
                const normalized = question.replace(/\\n/g, "\n");

                return (
                  <button
                    key={index}
                    className="select-text border-l-4 border-l-addhosblue text-left overflow-x-auto border border-gray-300 rounded p-2 hover:bg-gray-200"
                    onClick={() => handleQuestionClick(index + 1)}

                  >
                    <ReactMarkdown
                      children={normalized}
                      remarkPlugins={[remarkGfm]}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {(chatData.length > 0 || singleDate) && (
        <div
          className={
            singleDate === null || loading || isAskPending
              ? "pointer-events-none opacity-50"
              : ""
          }
        >
          <AskQuestion />
        </div>
      )}
    </div>
  );
};

export default React.memo(Chat);
