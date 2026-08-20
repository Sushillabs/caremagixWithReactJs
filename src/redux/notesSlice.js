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
        isEditLocked: false,
        templateReadyForReview: false,
        savedAt: null,
        reviewable_template: null,
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

            state.reviewable_template = action.payload;
            state.isEditLocked = true;
        },
        addInputAns: (state, action) => {
            state.pendingChat = {
                id: crypto.randomUUID(),
                answer: action.payload,
            };
        },
        addLocalTurn: (state, action) => {
            state.notes_chat.push({
                id: crypto.randomUUID(),
                answer: action.payload.answer,
                question: action.payload.question,
            });
        },
        clearNotes: (state) => {
            state.notes_chat = [];
            state.pendingChat = null;
            state.activeTemplate = null;
            state.final_template=null;
            state.isEditLocked = false;
            state.templateReadyForReview = false;
            state.savedAt = null;
            state.reviewable_template = null;
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
                if (action.payload?.pdf_path) {
                    state.savedAt = new Date().toISOString();
                }
                if (action.payload?.awaiting_confirmation && action.payload?.next_field === 'generating the final visit note') {
                    // All fields answered/confirmed, not yet polished — this is the
                    // window where the raw per-field template can still be edited
                    // before the user confirms "yes, generate the final note".
                    state.templateReadyForReview = true;
                    state.reviewable_template = action.payload?.template;
                }
                if (action.payload?.final_template) {
                    // The generate-now checkpoint has passed — editing window is closed.
                    state.templateReadyForReview = false;
                }
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
                        let newQ=`${action.payload?.message} You can now review, download, or email this visit note using the buttons above.`
                        completed = { ...state.pendingChat, question: newQ };
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

export const { reviewTempalte, addInputAns, addLocalTurn, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;