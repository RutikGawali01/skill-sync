import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import skillReducer from './skillSlice';
import verificationReducer from './verificationSlice';
import availabilityReducer from './availabilitySlice';
import sessionReducer from './session/sessionSlice';
import reviewReducer from './review/reviewSlice';
import trustReducer from './review/trustSlice';

const store = configureStore({
  reducer: {
    auth:         authReducer,
    profile:      profileReducer,
    skills:       skillReducer,
    verification: verificationReducer,
    availability: availabilityReducer,
    sessions:     sessionReducer,
    reviews:      reviewReducer,
    trust:        trustReducer,
  },
});

export default store;
