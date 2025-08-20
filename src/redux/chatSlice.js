
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPatientChat } from '../api/hospitalApi';
import { set } from 'lodash';

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
        },
        setAskPending: (state, action) => {
            state.isAskPending = action.payload;
        }
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientChat.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPatientChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { clearChat,addQconversation, setAskPending } = chatSlice.actions;
export default chatSlice.reducer;
