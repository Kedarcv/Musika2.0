import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { app } from '../../config/firebase';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const db = getFirestore(app);

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const addOrder = createAsyncThunk('orders/addOrder', async (newOrder) => {
    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return { id: docRef.id, ...newOrder };
});

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addOrder.fulfilled, (state, action) => {
                state.orders.push(action.payload);
            });
    },
});

export default orderSlice.reducer;
