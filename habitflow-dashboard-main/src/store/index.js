import { configureStore } from '@reduxjs/toolkit';
import habitReducer from './slices/habitSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    habits: habitReducer,
    auth: authReducer,
  },
});