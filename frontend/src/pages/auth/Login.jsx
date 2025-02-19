import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Google as GoogleIcon } from '@mui/icons-material';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  login,
  restaurantLogin,
  riderLogin,
  adminLogin,
} from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const [userType, setUserType] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setUserType(newValue);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await dispatch(login({ googleId: true }));
      if (result.payload) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    let result;
    switch (userType) {
      case 0: // Customer
        result = await dispatch(login(userData));
        if (result.payload) {
          navigate('/');
        }
        break;
      case 1: // Restaurant
        result = await dispatch(restaurantLogin(userData));
        if (result.payload) {
          navigate('/restaurant');
        }
        break;
      case 2: // Rider
        result = await dispatch(riderLogin(userData));
        if (result.payload) {
          navigate('/rider');
        }
        break;
      case 3: // Admin
        result = await dispatch(adminLogin(userData));
        if (result.payload) {
          navigate('/admin');
        }
        break;
      default:
        break;
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Welcome Back
          </Typography>

          <Tabs
            value={userType}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="Customer" />
            <Tab label="Restaurant" />
            <Tab label="Rider" />
            <Tab label="Admin" />
          </Tabs>

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {userType === 0 && (
            <>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{ mt: 1, mb: 2 }}
              >
                Sign in with Google
              </Button>
              <Typography variant="body2" align="center">
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </Typography>
            </>
          )}
          {userType === 1 && (
            <Typography variant="body2" align="center">
              Want to partner with us?{' '}
              <Link to="/register/restaurant" style={{ textDecoration: 'none' }}>
                Register Restaurant
              </Link>
            </Typography>
          )}
          {userType === 2 && (
            <Typography variant="body2" align="center">
              Want to be a rider?{' '}
              <Link to="/register/rider" style={{ textDecoration: 'none' }}>
                Become a Rider
              </Link>
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
