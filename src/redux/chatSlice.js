import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPatientChat } from '../api/hospitalApi';

export const fetchPatientChat = createAsyncThunk(
  'chat/fetchPatientChat',
  async (patientData, thunkAPI) => {
    try {
      const response = await getPatientChat(patientData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'askQ',
  initialState: {
    data: [],
    value:[],
    loading: false,
    error: null,
    isAskPending: false,
    mode: 'discharge',
    chatId: 0,
    initialData: null,
    initialPayload: null,
  },
    reducers: {
        addQconversation: (state, action) => {
            state.value.push(...action.payload);
        },
        // addQPayload: (state, action) => {
        //     state.value.push(action.payload);
        // },
        clearChat: (state) => {
            state.value = [];
            state.chatId += 1;
            state.isAskPending = false;
        },
        setAskPending: (state, action) => {
            state.isAskPending = action.payload;
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        },
        resetInitialChat: (state, action) => {
            state.initialData = null;
            state.initialPayload = action.payload || null;
        },
        restoreInitialChat: (state) => {
            state.data = state.initialData || [];
            state.value = [];
            state.chatId += 1;
            state.isAskPending = false;
            state.mode = 'discharge';
        }
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientChat.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.mode = 'discharge';
      })
      .addCase(fetchPatientChat.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        if (state.initialData === null) state.initialData = action.payload;
      })
      .addCase(fetchPatientChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { clearChat,addQconversation, setAskPending, setMode, resetInitialChat, restoreInitialChat } = chatSlice.actions;
export default chatSlice.reducer;
