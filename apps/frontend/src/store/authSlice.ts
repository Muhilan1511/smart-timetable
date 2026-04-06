import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { signInWithGoogle, signOutUser } from "../services/firebaseAuth.js";
import { AuthUser } from "../types.js";
import { AuthState } from "../types.js";

const initialState: AuthState = {
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  loading: false,
  error: null
};

export const loginWithGoogleAsync = createAsyncThunk<AuthUser>("auth/loginWithGoogle", async () => {
  return await signInWithGoogle();
});

export const logoutAsync = createAsyncThunk<void>("auth/logout", async () => {
  await signOutUser();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<AuthUser | null>) => {
      state.isInitializing = false;
      state.loading = false;
      state.error = null;
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setAuthInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogleAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleAsync.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginWithGoogleAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Google sign-in failed";
      })
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Logout failed";
      });
  }
});

export const { logout, setAuthSession, setAuthInitializing } = authSlice.actions;
export default authSlice.reducer;
