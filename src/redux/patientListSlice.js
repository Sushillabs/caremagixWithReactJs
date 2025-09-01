// src/redux/patientListSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deletePatient as deletePatientAPI } from "../api/hospitalApi";

// Thunk for deleting a patient
export const deletePatientThunk = createAsyncThunk(
    "patientnames/deletePatient",
    async ({ patient_type, patient_name, dateId }, { rejectWithValue }) => {
        try {
            const response = await deletePatientAPI(patient_type, patient_name);
            console.log("Delete response:", response);
            return { patient_type, name:patient_name, dateId, data: response.data }; // return what you need
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to delete patient");
        }
    }
);

export const patientListSlice = createSlice({
    name: "patientnames",
    initialState: {
        value: [],
        loading: false,
        error: null,
    },
    reducers: {
        addPatientNames: (state, action) => {
            state.value = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(deletePatientThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePatientThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted patient from the list
                let temppatientDates = state.value.find((patient) => patient.name === action.payload.name);
                console.log("Before deletion, patient dates:", temppatientDates);
                if (temppatientDates) {
                    temppatientDates.data = temppatientDates.data.filter((date) => date.dates !== action.payload.dateId);
                }
            })
            .addCase(deletePatientThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong";
            });
    },
});

export const { addPatientNames } = patientListSlice.actions;
export default patientListSlice.reducer;
