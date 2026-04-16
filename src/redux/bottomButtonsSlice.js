import { createSlice } from "@reduxjs/toolkit";


export const bottomButtonsSlice= createSlice({
    name:'buttonNames',
    initialState:{
        value:'',
        version: 0,
    },
    reducers:{
        addButtonNames:(state, action)=>{
            state.value=action.payload;
            state.version+=1
        }
    }
})

export const {addButtonNames}=bottomButtonsSlice.actions;
export default bottomButtonsSlice.reducer;