import { createSlice } from "@reduxjs/toolkit";


export const PatientSingleDateSlice = createSlice({
    name: 'patientsingledata',
    initialState: {
        value: null,
    },
    reducers: {
        addDischargePatientDate: (state, action) => {
            state.value = action.payload;
        },
        updatePatientData: (state, action) => {
            console.log("Updating patient data with payload:", action.payload);
            state.value.patient.raw.call_registered = action.payload.call_registered;
        }
    }
});

export const { addDischargePatientDate, updatePatientData } = PatientSingleDateSlice.actions;
export default PatientSingleDateSlice.reducer;
