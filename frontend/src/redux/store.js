import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import skillReducer from './skillSlice';
import verificationReducer from './verificationSlice';
import availabilityReducer from './availabilitySlice';
import sessionReducer from './session/sessionSlice';

const store = configureStore({
  reducer: {
    auth:         authReducer,
    profile:      profileReducer,
    skills:       skillReducer,
    verification: verificationReducer,
    availability: availabilityReducer,
    sessions:     sessionReducer,
  },
});

export default store;
