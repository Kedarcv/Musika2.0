import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../config/firebase';

const auth = getAuth(app);

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
});

export const registerUser = createAsyncThunk('auth/registerUser', async ({ email, password }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
