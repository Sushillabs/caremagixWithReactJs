import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getPatientChat, askAPI } from "../api/hospitalApi";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { addQconversation } from "../redux/chatSlice";
import { FaPlus } from "react-icons/fa6";
import { Spinner } from "./Spiner";
const Chat = () => {
  const [loading, setLoading] = useState(false);
  const [chatData, setChatData] = useState([]);
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const get_conversation = useSelector((state) => state?.askQ?.value);
  console.log("getConversation", get_conversation);
  const dispatch = useDispatch();
  console.log("singleDate 111→", singleDate);
  useEffect(() => {
    const fetchChat = async () => {
      console.log("singleDate →", singleDate);
      if (!singleDate || Object.keys(singleDate).length === 0) return;

      try {
        const res = await getPatientChat(singleDate);
        console.log("chat response →", res);
        setChatData(res);
      } catch (error) {
        console.error("Error fetching chat data:", error.message);
      }
    };
    fetchChat();
  }, [singleDate]);

  // const get_conversation=[];
  // const get_conversation=[
  //     {
  //         "role": "user",
  //         "content": "1. What is the primary diagnosis for Geraldine T. Copp as indicated in the prescription forms?"
  //     },
  //     {
  //         "role": "assistant",
  //         "content": "The primary diagnosis for Geraldine T. Copp as indicated in the prescription forms is acute and subacute endocarditis, coded as 133.9."
  //     },
  //     {
  //         "role": "user",
  //         "content": "1. What is the primary diagnosis for Geraldine T. Copp as indicated in the prescription forms?"
  //     },
  //     {
  //         "role": "assistant",
  //         "content": "The primary diagnosis for Geraldine T. Copp as indicated in the prescription forms is acute and subacute endocarditis, coded as 133.9."
  //     }
  // ]
  const handleQuestionClick = async (ind) => {
    setLoading(true);
    const latestConversation = [];
    const currentQuestion = chatData[ind];
    const parts = [{ content: currentQuestion, role: 'user' }];
    // console.log('Question',currentQuestion);
    const newId = crypto.randomUUID();
    const askQPayload = {
      ...singleDate,
      meta: {
        id: newId,
        content: {
          conversation: await get_conversation,
          content_type: "text",
          parts: parts
        },
      },
    }

    try {
      const res = await askAPI(askQPayload);
      const assisRes = { content: res, role: 'assistant' }
      latestConversation.push(...parts);
      latestConversation.push(assisRes);
      console.log('dispatch last conversation', latestConversation)
      dispatch(addQconversation(latestConversation))
      console.log('dispatch last conversation2', latestConversation)
      setLoading(false);
    } catch (error) {
      console.error('Error', error);
    }
    console.log('askPayload', askQPayload);
  }

  const format = (text) => text.replace(/(?:\r\n|\r|\n)/g, "<br>");
  // if(get_conversation.length ===0) return <Spinner/>

  return (
    <div className="bg-white h-[58vh] ml-4 rounded mt-12 overflow-auto p-4">
      {chatData.length > 0 && get_conversation.length === 0 && loading ? <Spinner /> : (
        <>
          {chatData.length > 0 && get_conversation.length === 0 && (
            <div className=" flex items-center gap-2">
              <img
                src="images/favicon/android-chrome-192x192.png"
                alt="App Icon"
                className="w-18 h-16 border border-gray-500 object-contain rounded-lg"
              />
              <span>
                Welcome!! try asking me questions related to{" "}
                {singleDate.patient_type} Plan. You can ask questions like:
              </span>
            </div>
          )}

          {chatData.length > 0 && get_conversation.length === 0 && (<div className="mt-6 ml-18 space-y-6">
            {chatData.map((question, index) => {
              let normalized = question.replace(/\\n/g, "\n");

              // normalized = normalized
              // .replace(/(\d+\.\s)/g, "<p>$1")
              // .replace(/<\/p>\s*(?=\d+\.)/g, "<br>");

              // html = parsedHtml;

              const content = (
                <ReactMarkdown
                  children={normalized}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ...(index === 0 && {
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

              if (index === 0) {
                // Not clickable
                return (
                  <div
                    key={index}
                    className="overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100"
                  >
                    {content}
                  </div>
                );
              }

              // Clickable for all others
              return (
                <button
                  key={index}
                  className=" flex justify-between items-center select-text border-l-4 border-l-addhosblue w-full text-left overflow-x-auto border border-gray-300 rounded p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleQuestionClick(index)}
                >
                  {content}<span>{<FaPlus />}</span>
                </button>
              );
            })}

          </div>)}

          {get_conversation.length > 0 && (
            get_conversation.map((conversation, ind) => {
              let normalized = conversation.content.replace(/\\n/g, "\n");
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
                    key={ind}
                    className="overflow-x-auto border border-gray-300 rounded p-2 bg-gray-100 mb-2"
                  >
                    {content}
                  </div>
                );
              }
              return <div className=" flex items-center space-y-2" key={ind}>
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
        </>
      )}
    </div>
  );
};

export default Chat;
