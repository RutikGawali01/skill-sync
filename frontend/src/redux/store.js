import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import skillReducer from './skillSlice';
import verificationReducer from './verificationSlice';

const store = configureStore({
  reducer: {
    auth:         authReducer,
    profile:      profileReducer,
    skills:       skillReducer,
    verification: verificationReducer,
  },
});

export default store;
