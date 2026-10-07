import { createSlice, createAction } from "@reduxjs/toolkit";

export const AUTH_STORAGE_KEY = "auth";

export const tokenExpiresAt = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt !== null && expiresAt <= Date.now();
};

const loadSavedAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved?.token && !isTokenExpired(saved.token)) return saved;
  } catch {
    // ignore unreadable storage
  }
  return {};
};

export const logout = createAction("auth/logout");
export const authSlice = createSlice({
  name: "auth",
  initialState: () => ({
    value: loadSavedAuth(),
    item: {},
  }),
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
