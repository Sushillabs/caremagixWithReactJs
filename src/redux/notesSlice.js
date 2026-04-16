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
        final_template:null,
        template: {
            data: null,
            loading: false,
            error: null,
        }
    },
    reducers: {
        reviewTempalte: (state, action) => {

            state.activeTemplate.template = action.payload;

            state.template.data.template = action.payload;
        },
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
            state.final_template=null;
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
                    let completed;
                    if(action.payload?.current_field){
                        completed = { ...state.pendingChat, question: action.payload?.next_question };
                    }
                    if (action.payload?.final_template) {
                        state.final_template= action.payload?.final_template;
                        completed = { ...state.pendingChat, question: action.payload?.next_question, final_template:action.payload?.final_template };
                    }
                    if(action.payload?.email_status === 'Email not sent (missing flag or recipient).'){
                        let newQ=`${action.payload?.message} Would you like to email this visit note? Please provide email id.`
                        completed = { ...state.pendingChat, question: newQ, isDownload:true };
                    }
                    if(action.payload?.email_status === 'Email sent successfully.'){                    
                        completed = { ...state.pendingChat, question: action.payload?.email_status, isEmailDone:true };
                    }  
                    
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

export const { reviewTempalte, addInputAns, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;