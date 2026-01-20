import React, { useMemo } from "react";
import { Spinner } from "./Spiner";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import useMyQuery from "../hooks/useMyQuery";
import { mmta } from "../api/hospitalApi";
import "../css/style.css";

const Mmta = () => {
  const generatedQ = useSelector((state) => state.askQ.data);
  const lastQuestion = useMemo(() => generatedQ?.at(-1), [generatedQ]);

  const { data, isPending, isError, error } = useMyQuery({
    api: () => mmta({ question: lastQuestion }),
    id: ["mmta", lastQuestion],
    enabled: !!lastQuestion,
    staleTime: Infinity, // cache forever per question
  });

  if (isPending) return <Spinner />;

  if (isError)
    return (
      <p className="text-red-600 text-center mt-4">
        {error.message}
      </p>
    );

  return (
    <div className="llm-response h-full overflow-auto p-2 sm:p-4 rounded-lg bg-white">
      <div className="llm-question text-sm sm:text-base font-medium text-gray-800 mb-3">
        <strong>Q:</strong> {data?.question}
      </div>

      <div className="llm-answer text-xs sm:text-sm mt-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {data?.response}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default React.memo(Mmta);