import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const user = JSON.parse(localStorage.getItem('user'));
const googleProvider = new GoogleAuthProvider();

const initialState = {
  user: user || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const { email, password, name } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: 'customer',
        createdAt: new Date().toISOString()
      });

      const userWithData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name,
        role: 'customer'
      };

      localStorage.setItem('user', JSON.stringify(userWithData));
      return userWithData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      let userCredential;
      
      if (userData.googleId) {
        // Google Sign In
        userCredential = await signInWithPopup(auth, googleProvider);
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (!userDoc.exists()) {
          // Create new user document if it doesn't exist
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            role: 'customer',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Regular Login
        userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      }

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      const userWithData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userData.name,
        role: userData.role
      };

      localStorage.setItem('user', JSON.stringify(userWithData));
      return userWithData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Restaurant login
export const restaurantLogin = createAsyncThunk(
  'auth/restaurantLogin',
  async (userData, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Get restaurant data from Firestore
      const restaurantDoc = await getDoc(doc(db, 'restaurants', userCredential.user.uid));
      
      if (!restaurantDoc.exists() || restaurantDoc.data().role !== 'restaurant') {
        throw new Error('Not authorized as restaurant');
      }

      const restaurantData = restaurantDoc.data();
      const userWithData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: restaurantData.name,
        role: 'restaurant',
        ...restaurantData
      };

      localStorage.setItem('user', JSON.stringify(userWithData));
      return userWithData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Rider login
export const riderLogin = createAsyncThunk(
  'auth/riderLogin',
  async (userData, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Get rider data from Firestore
      const riderDoc = await getDoc(doc(db, 'riders', userCredential.user.uid));
      
      if (!riderDoc.exists() || riderDoc.data().role !== 'rider') {
        throw new Error('Not authorized as rider');
      }

      const riderData = riderDoc.data();
      const userWithData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: riderData.name,
        role: 'rider',
        ...riderData
      };

      localStorage.setItem('user', JSON.stringify(userWithData));
      return userWithData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (userData, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Get admin data from Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        throw new Error('Not authorized as admin');
      }

      const adminData = adminDoc.data();
      const userWithData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: adminData.name,
        role: 'admin',
        ...adminData
      };

      localStorage.setItem('user', JSON.stringify(userWithData));
      return userWithData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Logout user
// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      // Update user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const updatedUser = {
        ...userData,
        uid: user.uid,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update rider profile
export const updateRiderProfile = createAsyncThunk(
  'auth/updateRiderProfile',
  async (riderData, thunkAPI) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      // Update rider document in Firestore
      await setDoc(doc(db, 'riders', user.uid), {
        ...riderData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const updatedRider = {
        ...riderData,
        uid: user.uid,
        role: 'rider'
      };

      localStorage.setItem('user', JSON.stringify(updatedRider));
      return updatedRider;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
  localStorage.removeItem('user');
});

// Add the new cases to handle profile updates
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Restaurant Login
      .addCase(restaurantLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restaurantLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(restaurantLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Rider Login
      .addCase(riderLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(riderLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(riderLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Rider Profile
      .addCase(updateRiderProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRiderProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateRiderProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
