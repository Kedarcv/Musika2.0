import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurant: null,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload;
      
      // Check if adding item from different restaurant
      if (state.restaurant && state.restaurant.id !== restaurantId) {
        // Clear cart if items are from different restaurant
        state.items = [];
        state.restaurant = {
          id: restaurantId,
          name: restaurantName,
        };
      }

      // Set restaurant if cart is empty
      if (!state.restaurant) {
        state.restaurant = {
          id: restaurantId,
          name: restaurantName,
        };
      }

      // Check if item already exists in cart
      const existingItem = state.items.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      // Calculate totals
      state.subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      state.tax = state.subtotal * 0.1; // 10% tax
      state.total = state.subtotal + state.tax + state.deliveryFee;
    },
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);

      // Clear restaurant if cart is empty
      if (state.items.length === 0) {
        state.restaurant = null;
      }

      // Recalculate totals
      state.subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      state.tax = state.subtotal * 0.1;
      state.total = state.subtotal + state.tax + state.deliveryFee;
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item._id === itemId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item._id !== itemId);
          // Clear restaurant if cart is empty
          if (state.items.length === 0) {
            state.restaurant = null;
          }
        } else {
          item.quantity = quantity;
        }

        // Recalculate totals
        state.subtotal = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        state.tax = state.subtotal * 0.1;
        state.total = state.subtotal + state.tax + state.deliveryFee;
      }
    },
    setDeliveryFee: (state, action) => {
      state.deliveryFee = action.payload;
      state.total = state.subtotal + state.tax + state.deliveryFee;
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.tax = 0;
      state.total = 0;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setDeliveryFee,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
