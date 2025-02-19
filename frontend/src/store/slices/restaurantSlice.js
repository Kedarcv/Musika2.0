import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../config/axios';

const initialState = {
  restaurants: [],
  selectedRestaurant: null,
  menu: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all restaurants
export const getRestaurants = createAsyncThunk(
  'restaurants/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/restaurants');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch restaurants';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get restaurant by ID
export const getRestaurantById = createAsyncThunk(
  'restaurants/getById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch restaurant';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get restaurant menu
export const getRestaurantMenu = createAsyncThunk(
  'restaurants/getMenu',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/restaurants/${id}/menu`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch menu';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search restaurants
export const searchRestaurants = createAsyncThunk(
  'restaurants/search',
  async (searchParams, thunkAPI) => {
    try {
      const response = await api.get('/restaurants/search', { params: searchParams });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to search restaurants';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update restaurant profile (Restaurant only)
export const updateRestaurantProfile = createAsyncThunk(
  'restaurants/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await api.put('/restaurants/profile', profileData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update restaurant menu (Restaurant only)
export const updateMenu = createAsyncThunk(
  'restaurants/updateMenu',
  async (menuData, thunkAPI) => {
    try {
      const response = await api.put('/restaurants/menu', menuData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update menu';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get restaurant analytics (Restaurant only)
export const getRestaurantAnalytics = createAsyncThunk(
  'restaurants/getAnalytics',
  async (dateRange, thunkAPI) => {
    try {
      const response = await api.get('/restaurants/analytics', { params: dateRange });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch analytics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
      state.menu = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Restaurants
      .addCase(getRestaurants.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.restaurants = action.payload;
      })
      .addCase(getRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Restaurant by ID
      .addCase(getRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getRestaurantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedRestaurant = action.payload;
      })
      .addCase(getRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Restaurant Menu
      .addCase(getRestaurantMenu.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getRestaurantMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.menu = action.payload;
      })
      .addCase(getRestaurantMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Search Restaurants
      .addCase(searchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.restaurants = action.payload;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Restaurant Profile
      .addCase(updateRestaurantProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateRestaurantProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedRestaurant = action.payload;
      })
      .addCase(updateRestaurantProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Menu
      .addCase(updateMenu.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.menu = action.payload;
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setSelectedRestaurant, clearSelectedRestaurant } =
  restaurantSlice.actions;
export default restaurantSlice.reducer;
