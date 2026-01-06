import useMyMutation from "../hooks/useMyMutation"
import { mmta } from "../api/hospitalApi"
import { Spinner } from "./Spiner";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import '../css/style.css'
// import {}
const Mmta = () => {
  const generatedQ = useSelector(state => state.askQ.data);
  console.log("generatedQ in mmta", generatedQ);
  const { mutate, isPending, error, data } = useMyMutation({
    api: mmta,
    toastId: 'mmta',
  });
  useEffect(() => {
    const lastQuestion = generatedQ.at(-1);
    if (lastQuestion) {
      mutate({ question: lastQuestion });
    }
  }, [generatedQ]);

  if (isPending) return <Spinner />;
  if (error) return <p className="text-red-600 text-center mt-4">{error.message}</p>;
  return (
    <div className="llm-response h-full overflow-y-auto w-full">
      <div className="llm-question">
        <strong>Q:</strong> {data?.question}
      </div>

      <div className="llm-answer overflow-x-auto min-h-0 overflow-wrap">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {data?.response}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Mmta