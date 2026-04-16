import { createSlice } from "@reduxjs/toolkit";


export const tabSlice= createSlice({
    name:'tab',
    initialState:{
        value:'',
        version: 0,
    },
    reducers:{
        addActiveTab:(state, action)=>{
            state.value=action.payload;
            // state.version+=1
        }
    }
})

export const {addActiveTab}=tabSlice.actions;
export default tabSlice.reducer;