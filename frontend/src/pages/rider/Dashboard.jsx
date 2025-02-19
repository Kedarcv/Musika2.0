import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { getRiderActiveOrder } from '../../store/slices/orderSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeOrder, isLoading } = useSelector((state) => state.orders);

  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [location, setLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  useEffect(() => {
    dispatch(getRiderActiveOrder());
    // TODO: Implement earnings fetch
  }, [dispatch]);

  useEffect(() => {
    if (isAvailable) {
      // Start location tracking
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          // TODO: Update location in backend
        },
        (error) => {
          console.error('Error getting location:', error);
          setOpenDialog(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      setWatchId(id);
    } else if (watchId) {
      // Stop location tracking
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isAvailable]);

  const handleAvailabilityToggle = () => {
    if (!isAvailable && !location) {
      setOpenDialog(true);
      return;
    }
    setIsAvailable(!isAvailable);
    // TODO: Update availability status in backend
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ActiveOrderCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Order
        </Typography>
        {activeOrder ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order #{activeOrder._id.slice(-6)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {activeOrder.restaurant.name} →{' '}
                  {activeOrder.deliveryAddress.street}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {new Date(activeOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                // TODO: Implement status update
              }}
            >
              Update Status
            </Button>
          </>
        ) : (
          <Typography color="text.secondary">No active order</Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4">Dashboard</Typography>
          <FormControlLabel
            control={
              <Switch checked={isAvailable} onChange={handleAvailabilityToggle} />
            }
            label={isAvailable ? 'Available' : 'Unavailable'}
          />
        </Box>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Today's Earnings"
              value={`$${earnings.today.toFixed(2)}`}
              icon={<MoneyIcon color="success" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Weekly Earnings"
              value={`$${earnings.week.toFixed(2)}`}
              icon={<MoneyIcon color="primary" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Monthly Earnings"
              value={`$${earnings.month.toFixed(2)}`}
              icon={<MoneyIcon color="secondary" />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Active Order */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ActiveOrderCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Location
                </Typography>
                {location ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <BikeIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Latitude: {location.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Longitude: {location.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Location tracking is disabled
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Location Permission Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Location Access Required</DialogTitle>
          <DialogContent>
            <Typography>
              To be available for deliveries, you need to enable location access.
              Please enable location services in your browser settings.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Dashboard;
