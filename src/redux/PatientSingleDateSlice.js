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
            Object.assign(state.value.patient.raw, action.payload);
        }
    }
});

export const { addDischargePatientDate, updatePatientData } = PatientSingleDateSlice.actions;
export default PatientSingleDateSlice.reducer;
