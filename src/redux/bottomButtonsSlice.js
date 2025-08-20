import { createSlice } from "@reduxjs/toolkit";


export const bottomButtonsSlice= createSlice({
    name:'buttonNames',
    initialState:{
        value:'',
    },
    reducers:{
        addButtonNames:(state, action)=>{
            state.value=action.payload;
        }
    }
})

export const {addButtonNames}=bottomButtonsSlice.actions;
export default bottomButtonsSlice.reducer;