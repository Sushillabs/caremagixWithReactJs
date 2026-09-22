// hooks/useAskQuestion.js
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { addQconversation , setAskPending} from '../redux/chatSlice';
import { askAPI } from '../api/hospitalApi'; 

const useAskQuestion = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const singleDate = useSelector((state) => state?.patientsingledata?.value);
  const get_conversation = useSelector(state => state.askQ.value); 

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ chatId, ...data }) => askAPI(data),
    onMutate: () => {
      dispatch(setAskPending(true));
    },
    onSuccess: (res, variables) => {
      if (variables.chatId !== store.getState().askQ.chatId) return;
      const parts = variables.meta.content.parts;
      const latestConversation = [
        ...parts,
        { content: res, role: 'assistant',id: variables.meta.id },
      ];
      // dispatch(addQPayload(variables));
      dispatch(addQconversation(latestConversation));
      dispatch(setAskPending(false));
    },
    onSettled: () => {
      dispatch(setAskPending(false));
    },
    onError: (err) => {
      dispatch(setAskPending(false));
      console.error('Mutation error:', err);
    },
  });

  const askQuestion = (questionContent) => {
    const newId = crypto.randomUUID();
    const parts = [{ content: questionContent, role: 'user' }];

    const askQPayload = {
      ...singleDate,
      meta: {
        id: newId,
        content: {
          conversation: get_conversation,
          content_type: "text",
          parts: parts,
        },
      },
    };

    mutate({ ...askQPayload, chatId: store.getState().askQ.chatId });
    console.log("askPayload", askQPayload);
  };

  return { askQuestion, isPending, isError, error };
};

export default useAskQuestion;
