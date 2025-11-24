// Redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import searchReducer from './searchSlice';
import cartReducer from './cartSlice'; // Import the cart slice

const store = configureStore({
  reducer: {
    auth: authReducer,     // Auth reducer (no persistence)
    search: searchReducer, // Search reducer
    cart: cartReducer,     // Cart reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
