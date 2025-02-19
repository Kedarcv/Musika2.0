import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { getUserOrders } from '../../store/slices/orderSlice';

const OrderHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'preparing':
      case 'ready_for_pickup':
      case 'picked_up':
        return 'warning';
      case 'on_the_way':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {[1, 2, 3].map((index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Skeleton variant="text" width="60%" height={32} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="text" width="40%" height={24} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="text" width="30%" height={24} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom>
            No orders yet
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
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>

        {orders.map((order) => (
          <Card key={order._id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {order.restaurant.name}
                    </Typography>
                    <Chip
                      label={formatStatus(order.orderStatus)}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ my: 1 }}>
                    {order.items.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.quantity}x {item.name}
                      </Typography>
                    ))}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">
                      Total: ${order.total.toFixed(2)}
                    </Typography>
                    <Button
                      variant="outlined"
                      endIcon={<NavigateNextIcon />}
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default OrderHistory;
