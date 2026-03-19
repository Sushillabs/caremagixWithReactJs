import { createSlice, createAction } from "@reduxjs/toolkit";


export const logout = createAction("auth/logout");
export const authSlice = createSlice({
  name: "auth", 
  initialState: {
    value: {},
    item:{}  
  },
  reducers: {
    setAuth: (state, action) => {
      state.value=action.payload;
    },
    setHederKey: (state, action) => {
      state.item=action.payload;
    },
    clearAuth: (state) => {
      state.value = null;
      state.item='';
    },
  },
});

export const { setAuth, clearAuth, setHederKey } = authSlice.actions;
export default authSlice.reducer;
