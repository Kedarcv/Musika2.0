import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { app } from '../../config/firebase';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const db = getFirestore(app);

export const fetchRestaurants = createAsyncThunk('restaurants/fetchRestaurants', async () => {
    const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
    return restaurantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const addRestaurant = createAsyncThunk('restaurants/addRestaurant', async (newRestaurant) => {
    const docRef = await addDoc(collection(db, 'restaurants'), newRestaurant);
    return { id: docRef.id, ...newRestaurant };
});

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState: {
        restaurants: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRestaurants.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload;
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addRestaurant.fulfilled, (state, action) => {
                state.restaurants.push(action.payload);
            });
    },
});

export default restaurantSlice.reducer;
