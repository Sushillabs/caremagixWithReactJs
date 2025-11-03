// src/redux/patientListSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deletePatient as deletePatientAPI } from "../api/hospitalApi";

// Thunk for deleting a patient
export const deletePatientThunk = createAsyncThunk(
    "patientnames/deletePatient",
    async ({ patient_type, patient_name, dataType }, { rejectWithValue }) => {
        try {
            const response = await deletePatientAPI(patient_type, patient_name);
            console.log("Delete response:", response);
            return { patient_type, nameWithKey: patient_name, dataType, data: response.data }; // return what you need
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
                const { nameWithKey, dataType } = action.payload;

                state.value = state.value
                    .map((patient) => {
                        if (dataType === "data" && patient.raw?.data) {
                            const updatedSubData = patient.raw.data.filter(
                                (p) => p.patient_name !== nameWithKey
                            );
                            return updatedSubData.length > 0
                                ? { ...patient, raw: { ...patient.raw, data: updatedSubData } }
                                : null;
                        }
                        return patient; 
                    })
                    .filter(Boolean); 
            })

            .addCase(deletePatientThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Something went wrong";
            });
    },
});

export const { addPatientNames } = patientListSlice.actions;
export default patientListSlice.reducer;
