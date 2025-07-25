import { createSlice } from "@reduxjs/toolkit";


export const chatSlice= createSlice({
    name:'askQ',
    initialState:{
        value:[],
    },
    reducers:{
        addQconversation:(state, action)=>{
            state.value.push(...action.payload); // ✅ Mutate directly (RTK uses Immer)
        },
        deleteQconversation:(state)=>{
            state.value.length=[];
        }
    }
})

export const { addQconversation, deleteQconversation}=chatSlice.actions;
export default chatSlice.reducer;
