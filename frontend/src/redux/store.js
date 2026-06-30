import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import skillReducer from './skillSlice';
import verificationReducer from './verificationSlice';
import availabilityReducer from './availabilitySlice';
import sessionReducer from './session/sessionSlice';
import reviewReducer from './review/reviewSlice';
import trustReducer from './review/trustSlice';
import notificationReducer from './notification/notificationSlice';
import matchReducer from './matchSlice';

const appReducer = combineReducers({
  auth:         authReducer,
  profile:      profileReducer,
  skills:       skillReducer,
  verification: verificationReducer,
  availability: availabilityReducer,
  sessions:     sessionReducer,
  reviews:       reviewReducer,
  trust:         trustReducer,
  notifications: notificationReducer,
  matches:       matchReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
