import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import theme from './theme';

// Layouts
import UserLayout from './layouts/UserLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import RiderLayout from './layouts/RiderLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import Home from './pages/user/Home';
import RestaurantList from './pages/user/RestaurantList';
import RestaurantDetail from './pages/user/RestaurantDetail';
import Cart from './pages/user/Cart';
import OrderHistory from './pages/user/OrderHistory';
import OrderTracking from './pages/user/OrderTracking';
import UserProfile from './pages/user/Profile';

// Restaurant Pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';
import RestaurantAnalytics from './pages/restaurant/Analytics';
import RestaurantProfile from './pages/restaurant/Profile';

// Rider Pages
import RiderDashboard from './pages/rider/Dashboard';
import DeliveryManagement from './pages/rider/DeliveryManagement';
import Earnings from './pages/rider/Earnings';
import RiderProfile from './pages/rider/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RestaurantManagement from './pages/admin/RestaurantManagement';
import RiderManagement from './pages/admin/RiderManagement';
import AdminAnalytics from './pages/admin/Analytics';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up Firebase auth state observer
const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user); // Log the user state
      if (user) {
        // User is signed in
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // User is signed out
        localStorage.removeItem('user');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<RestaurantList />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Restaurant Routes */}
            <Route
              element={
                <ProtectedRoute role="restaurant">
                  <RestaurantLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/restaurant" element={<RestaurantDashboard />} />
              <Route path="/restaurant/menu" element={<MenuManagement />} />
              <Route path="/restaurant/orders" element={<OrderManagement />} />
              <Route path="/restaurant/analytics" element={<RestaurantAnalytics />} />
              <Route path="/restaurant/profile" element={<RestaurantProfile />} />
            </Route>

            {/* Rider Routes */}
            <Route
              element={
                <ProtectedRoute role="rider">
                  <RiderLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/rider" element={<RiderDashboard />} />
              <Route path="/rider/deliveries" element={<DeliveryManagement />} />
              <Route path="/rider/earnings" element={<Earnings />} />
              <Route path="/rider/profile" element={<RiderProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/restaurants" element={<RestaurantManagement />} />
              <Route path="/admin/riders" element={<RiderManagement />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
