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
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Restaurant as RestaurantIcon,
  TwoWheeler as DeliveryIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { getRestaurantAnalytics } from '../../store/slices/restaurantSlice';
import { getRestaurantOrders } from '../../store/slices/orderSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading: ordersLoading } = useSelector(
    (state) => state.orders
  );
  const [isOpen, setIsOpen] = useState(user?.isOpen || false);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    // Get today's orders
    dispatch(getRestaurantOrders());

    // Get analytics for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    dispatch(getRestaurantAnalytics({ startDate, endDate })).then((result) => {
      if (result.payload) {
        setAnalytics(result.payload);
      }
    });
  }, [dispatch]);

  const handleStatusToggle = () => {
    setIsOpen(!isOpen);
    // TODO: Update restaurant status in backend
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

  const ActiveOrderCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
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
          <Typography
            variant="subtitle2"
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.main',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {order.orderStatus.replace('_', ' ').toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
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
          <Typography variant="subtitle1">
            Total: ${order.total.toFixed(2)}
          </Typography>
          <Button variant="contained" size="small">
            Update Status
          </Button>
        </Box>
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
              <Switch checked={isOpen} onChange={handleStatusToggle} />
            }
            label={isOpen ? 'Open' : 'Closed'}
          />
        </Box>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={analytics.totalOrders}
              icon={<RestaurantIcon color="primary" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue"
              value={`$${analytics.totalRevenue.toFixed(2)}`}
              icon={<TrendingUpIcon color="success" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Rate"
              value={`${analytics.completionRate.toFixed(1)}%`}
              icon={<DeliveryIcon color="info" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Order Value"
              value={`$${analytics.averageOrderValue.toFixed(2)}`}
              icon={<StarIcon color="warning" />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Active Orders */}
        <Typography variant="h5" gutterBottom>
          Active Orders
        </Typography>
        {ordersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders
              .filter(
                (order) =>
                  order.orderStatus !== 'delivered' &&
                  order.orderStatus !== 'cancelled'
              )
              .map((order) => (
                <Grid item xs={12} md={6} key={order._id}>
                  <ActiveOrderCard order={order} />
                </Grid>
              ))}
            {orders.filter(
              (order) =>
                order.orderStatus !== 'delivered' &&
                order.orderStatus !== 'cancelled'
            ).length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No active orders
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
