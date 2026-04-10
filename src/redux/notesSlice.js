import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dischargePlan } from '../api/hospitalApi';

export const fetchDischargePlan = createAsyncThunk('notes/fetchDischargePlan', async (payload, { rejectWithValue }) => {
    try {
        const res = await dischargePlan(payload);
        console.log(res)
        return res;
    } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
    }
})

const notesSlice = createSlice({
    name: 'notes',
    initialState: {
        activeTemplate: null,
        notes_chat: [],
        pendingChat: null,
        firstQ: '',
        template: {
            data: null,
            loading: false,
            error: null,
        }
    },
    reducers: {
        // addTemplate: (state, action) => {
        //     if (!state.pendingChat) {
        //         state.firstQ = action.payload?.next_question
        //     }

        //     if (state.pendingChat) {
        //         const completed = { ...state.pendingChat, question: action.payload?.next_question };
        //         state.notes_chat.push(completed);
        //         state.pendingChat = null;
        //     }

        //     state.activeTemplate = action.payload;
        // },
        addInputAns: (state, action) => {
            state.pendingChat = {
                id: crypto.randomUUID(),
                answer: action.payload,
            };
        },
        clearNotes: (state) => {
            state.notes_chat = [];
            state.pendingChat = null;
            state.activeTemplate = null;
            state.firstQ = '';
            state.template = {
                data: null,
                loading: false,
                error: null,
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDischargePlan.pending, (state) => {
                state.template.loading = true;
                state.template.error = null;
            })
            .addCase(fetchDischargePlan.fulfilled, (state, action) => {
                state.template.loading = false;
                state.template.data = action.payload
                state.activeTemplate = action.payload;
                if (!state.pendingChat) {
                    state.firstQ = action.payload?.next_question
                }

                if (state.pendingChat) {
                    const completed = { ...state.pendingChat, question: action.payload?.next_question };
                    state.notes_chat.push(completed);
                    state.pendingChat = null;
                }
            })
            .addCase(fetchDischargePlan.rejected, (state, action) => {
                state.template.loading = false;
                state.template.error = action.error.message;
            })
    }
});

export const { addTemplate, addInputAns, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;