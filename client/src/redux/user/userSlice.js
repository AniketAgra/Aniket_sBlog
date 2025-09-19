import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    error: null,
    loading: false
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
            state.error = null;
        },
        signInFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const { signInStart, signInSuccess, signInFail,updateStart, updateSuccess, updateFail,deleteFail,deleteStart,deleteSuccess } = userSlice.actions;
export const signOut = () => ({ type: 'user/signOut' });

// Handle signOut via extra reducer style (manual small reducer)
const originalReducer = userSlice.reducer;
export default function userReducer(state, action) {
    if (action.type === 'user/signOut') {
        return { currentUser: null, error: null, loading: false };
    }
    return originalReducer(state, action);
}