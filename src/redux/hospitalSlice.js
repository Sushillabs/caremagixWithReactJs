import { createSlice } from "@reduxjs/toolkit";


export const hospitalSlice= createSlice({
    name:'hospitalnames',
    initialState:{
        value:[],
    },
    reducers:{
        addHospitalNames:(state, action)=>{
            state.value=action.payload;
        }
    }
})

export const {addHospitalNames}=hospitalSlice.actions;
export default hospitalSlice.reducer;