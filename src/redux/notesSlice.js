import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    activeTemplate: null,
    notes_chat: [],
    pendingChat: {},
  },
  reducers: {
    addTemplate: (state, action) => {
      state.activeTemplate = action.payload;
      state.pendingChat = {
        id: crypto.randomUUID(),
        question: action.payload?.next_question,
      };
    },
    addInputAns: (state, action) => {
      const completed = { ...state.pendingChat, answer: action.payload };
      state.notes_chat.push(completed);
      state.pendingChat = {};
    },
    clearNotes: (state) => {
      state.notes_chat = [];
      state.pendingChat = {};
      state.activeTemplate = null;
    },
  },
});

export const { addTemplate, addInputAns, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;