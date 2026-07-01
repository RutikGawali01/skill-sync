import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Map of userId (string or number) -> boolean (online status)
  onlineUsers: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setUserPresence: (state, action) => {
      const { userId, online } = action.payload;
      state.onlineUsers[userId] = online;
    },
    setBulkPresence: (state, action) => {
      state.onlineUsers = { ...state.onlineUsers, ...action.payload };
    },
    clearPresence: (state) => {
      state.onlineUsers = {};
    },
  },
});

export const { setUserPresence, setBulkPresence, clearPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
