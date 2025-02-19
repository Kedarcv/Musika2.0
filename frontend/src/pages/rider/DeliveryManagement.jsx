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
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { getRiderActiveOrder } from '../../store/slices/orderSlice';

const DeliveryManagement = () => {
  const dispatch = useDispatch();
  const { activeOrder, isLoading } = useSelector((state) => state.orders);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [deliveryHistory, setDeliveryHistory] = useState([]);

  useEffect(() => {
    dispatch(getRiderActiveOrder());
    // TODO: Fetch delivery history
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleStatusUpdate = async () => {
    try {
      // TODO: Implement status update
      setOpenDialog(false);
      setStatusNote('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleNavigate = (address) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
    )}`;
    window.open(url, '_blank');
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'picked_up':
      case 'on_the_way':
        return 'warning';
      default:
        return 'default';
    }
  };

  const ActiveDeliveryCard = ({ order }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Order #{order._id.slice(-6)}</Typography>
          <Chip
            label={formatStatus(order.orderStatus)}
            color={getStatusColor(order.orderStatus)}
          />
        </Box>

        {/* Restaurant Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Pickup From:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <StoreIcon sx={{ mr: 1, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1">{order.restaurant.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {order.restaurant.address.street},{' '}
                {order.restaurant.address.city}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<PhoneIcon />}
            variant="outlined"
            size="small"
            href={`tel:${order.restaurant.phone}`}
            sx={{ mr: 1 }}
          >
            Call Restaurant
          </Button>
          <Button
            startIcon={<NavigationIcon />}
            variant="outlined"
            size="small"
            onClick={() => handleNavigate(order.restaurant.address)}
          >
            Navigate
          </Button>
        </Box>

        {/* Customer Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Deliver To:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <PersonIcon sx={{ mr: 1, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1">{order.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<PhoneIcon />}
            variant="outlined"
            size="small"
            href={`tel:${order.user.phone}`}
            sx={{ mr: 1 }}
          >
            Call Customer
          </Button>
          <Button
            startIcon={<NavigationIcon />}
            variant="outlined"
            size="small"
            onClick={() => handleNavigate(order.deliveryAddress)}
          >
            Navigate
          </Button>
        </Box>

        {/* Order Items */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Order Items:
          </Typography>
          {order.items.map((item, index) => (
            <Typography key={index} variant="body2">
              {item.quantity}x {item.name}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Update Status
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const DeliveryHistoryCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">
                Order #{order._id.slice(-6)}
              </Typography>
              <Chip
                label={formatStatus(order.orderStatus)}
                color={getStatusColor(order.orderStatus)}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StoreIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">{order.restaurant.name}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                {order.deliveryAddress.street}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Delivery Management
        </Typography>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Active Delivery" />
          <Tab label="Delivery History" />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedTab === 0 ? (
              activeOrder ? (
                <ActiveDeliveryCard order={activeOrder} />
              ) : (
                <Typography color="text.secondary" align="center">
                  No active delivery
                </Typography>
              )
            ) : (
              <>
                {deliveryHistory.length > 0 ? (
                  deliveryHistory.map((order) => (
                    <DeliveryHistoryCard key={order._id} order={order} />
                  ))
                ) : (
                  <Typography color="text.secondary" align="center">
                    No delivery history
                  </Typography>
                )}
              </>
            )}
          </>
        )}

        {/* Status Update Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Update Delivery Status</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Status Note (Optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DeliveryManagement;
