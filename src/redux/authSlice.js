

import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth", 
  initialState: {
    value: {},  
  },
  reducers: {
    setAuth: (state, action) => {
      state.value=action.payload;
    },
    clearAuth: (state) => {
      state.value = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
