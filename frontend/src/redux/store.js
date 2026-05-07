import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import skillReducer from './skillSlice';

const store = configureStore({
  reducer: {
    auth:    authReducer,
    profile: profileReducer,
    skills:  skillReducer,
  },
});

export default store;
