import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import {
  updateQuantity,
  removeItem,
  clearCart,
} from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, restaurant, subtotal, deliveryFee, tax, total } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  const [openCheckout, setOpenCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [error, setError] = useState('');

  const handleQuantityChange = (itemId, change) => {
    dispatch(updateQuantity({ itemId, quantity: change }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeItem(itemId));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.zipCode
    ) {
      setError('Please fill in all address fields');
      return;
    }

    const orderData = {
      restaurantId: restaurant.id,
      items: items.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
      })),
      deliveryAddress,
      paymentMethod,
      orderNotes,
      subtotal,
      deliveryFee,
      tax,
      total,
    };

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate(`/orders/${result._id}`);
    } catch (error) {
      setError(error.message || 'Something went wrong');
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/restaurants')}
            sx={{ mt: 2 }}
          >
            Browse Restaurants
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ py: 3 }}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Order from {restaurant?.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {items.map((item) => (
                <Box key={item._id} sx={{ mb: 2 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <Typography variant="subtitle1">{item.name}</Typography>
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
                    <Grid item>
                      <Typography variant="subtitle1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(item._id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography>Subtotal</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
                  <Grid item>
                    <Typography>Delivery Fee</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>${deliveryFee.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
                  <Grid item>
                    <Typography>Tax</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>${tax.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setOpenCheckout(true)}
                sx={{ mt: 2 }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Delivery Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={deliveryAddress.street}
                onChange={(e) =>
                  setDeliveryAddress({
                    ...deliveryAddress,
                    street: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={deliveryAddress.city}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={deliveryAddress.state}
                onChange={(e) =>
                  setDeliveryAddress({
                    ...deliveryAddress,
                    state: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={deliveryAddress.zipCode}
                onChange={(e) =>
                  setDeliveryAddress({
                    ...deliveryAddress,
                    zipCode: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Payment Method
          </Typography>
          <Button
            variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
            onClick={() => setPaymentMethod('cash')}
            sx={{ mr: 2 }}
          >
            Cash on Delivery
          </Button>
          <Button
            variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
            onClick={() => setPaymentMethod('card')}
          >
            Card Payment
          </Button>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Order Notes (Optional)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckout(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckout}>
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
