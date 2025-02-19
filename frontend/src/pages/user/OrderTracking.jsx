import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
  Button,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Restaurant as RestaurantIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import io from 'socket.io-client';
import { getOrderById } from '../../store/slices/orderSlice';

const steps = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'On the Way',
  'Delivered',
];

const OrderTracking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeOrder } = useSelector((state) => state.orders);

  const [socket, setSocket] = useState(null);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [ratings, setRatings] = useState({
    restaurant: 0,
    rider: 0,
  });
  const [reviews, setReviews] = useState({
    restaurant: '',
    rider: '',
  });

  useEffect(() => {
    dispatch(getOrderById(id));

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join order room
    newSocket.emit('join_order', id);

    // Listen for status updates
    newSocket.on('status_update', (data) => {
      if (data.orderId === id) {
        dispatch(getOrderById(id));
      }
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [dispatch, id]);

  const getStepIndex = (status) => {
    return steps.indexOf(status);
  };

  const handleRatingSubmit = async () => {
    try {
      // TODO: Implement rating submission
      setOpenRatingDialog(false);
    } catch (error) {
      console.error('Error submitting ratings:', error);
    }
  };

  if (!activeOrder) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" align="center">
            Loading order details...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Order Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Order #{activeOrder._id.slice(-6)}
            </Typography>
            <Stepper
              activeStep={getStepIndex(activeOrder.orderStatus)}
              alternativeLabel
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Restaurant Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RestaurantIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Restaurant</Typography>
                </Box>
                <Typography variant="subtitle1">
                  {activeOrder.restaurant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeOrder.restaurant.address.street},{' '}
                  {activeOrder.restaurant.address.city}
                </Typography>
                <Button
                  startIcon={<PhoneIcon />}
                  sx={{ mt: 1 }}
                  href={`tel:${activeOrder.restaurant.phone}`}
                >
                  {activeOrder.restaurant.phone}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Rider Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DeliveryIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Delivery Partner</Typography>
                </Box>
                {activeOrder.rider ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {activeOrder.rider.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {activeOrder.rider.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeOrder.rider.vehicleType} -{' '}
                          {activeOrder.rider.vehicleNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      startIcon={<PhoneIcon />}
                      href={`tel:${activeOrder.rider.phone}`}
                    >
                      {activeOrder.rider.phone}
                    </Button>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    Assigning delivery partner...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                {activeOrder.items.map((item) => (
                  <Box key={item._id} sx={{ mb: 2 }}>
                    <Grid container justifyContent="space-between">
                      <Grid item xs={8}>
                        <Typography>
                          {item.quantity}x {item.name}
                        </Typography>
                        {item.specialInstructions && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Note: {item.specialInstructions}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Typography>Subtotal</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>${activeOrder.subtotal.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>Delivery Fee</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>${activeOrder.deliveryFee.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>Tax</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>${activeOrder.tax.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">
                      ${activeOrder.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Address */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Delivery Address</Typography>
                </Box>
                <Typography>
                  {activeOrder.deliveryAddress.street},{' '}
                  {activeOrder.deliveryAddress.city},{' '}
                  {activeOrder.deliveryAddress.state}{' '}
                  {activeOrder.deliveryAddress.zipCode}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Rating Dialog */}
        <Dialog
          open={openRatingDialog}
          onClose={() => setOpenRatingDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Rate Your Order</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Restaurant Rating
              </Typography>
              <Rating
                value={ratings.restaurant}
                onChange={(event, newValue) =>
                  setRatings({ ...ratings, restaurant: newValue })
                }
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Restaurant Review"
                value={reviews.restaurant}
                onChange={(e) =>
                  setReviews({ ...reviews, restaurant: e.target.value })
                }
                sx={{ mt: 1 }}
              />
            </Box>
            {activeOrder.rider && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Rider Rating
                </Typography>
                <Rating
                  value={ratings.rider}
                  onChange={(event, newValue) =>
                    setRatings({ ...ratings, rider: newValue })
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Rider Review"
                  value={reviews.rider}
                  onChange={(e) =>
                    setReviews({ ...reviews, rider: e.target.value })
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRatingDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRatingSubmit}>
              Submit Ratings
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrderTracking;
