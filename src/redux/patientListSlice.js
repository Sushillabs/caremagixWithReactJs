// src/redux/patientListSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deletePatient as deletePatientAPI } from "../api/hospitalApi";

// Thunk for deleting a patient
export const deletePatientThunk = createAsyncThunk(
    "patientnames/deletePatient",
    async ({ patient_type, patient_name, dataType, patient_date }, { rejectWithValue }) => {
        try {
            const response = await deletePatientAPI(patient_type, patient_name, patient_date);
            console.log("Delete response:", response);
            return { patient_type, patient_date, patient_name, dataType, data: response.data }; // return what you need
        } catch (error) {
            return rejectWithValue(error?.response?.data || "Failed to delete patient");
        }
    }
);

export const patientListSlice = createSlice({
    name: "patientnames",
    initialState: {
        value: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        addPatientNames: (state, action) => {
            state.value = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(deletePatientThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deletePatientThunk.fulfilled, (state, action) => {

                const { patient_name, patient_date } = action.payload;

                const patient = state.value.find(p => p.name === patient_name);

                if (patient?.raw?.data) {
                    patient.raw.data = patient.raw.data.filter(item => item.dates !== patient_date)
                }

                state.value = state.value.filter(
                    (p) => (p.type==='pcc' || (p.raw?.data?.length > 1 && patient_date!=='Consolidated Med Summary'))
                );
                state.success = true;
                state.loading = false;
            })

            .addCase(deletePatientThunk.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload || "Something went wrong";
            });
    },
});

export const { addPatientNames } = patientListSlice.actions;
export default patientListSlice.reducer;
