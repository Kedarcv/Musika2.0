import { useState, useEffect } from 'react';
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
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { getRestaurantOrders, updateOrderStatus } from '../../store/slices/orderSlice';

const orderStatuses = [
  'all',
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'delivered',
  'cancelled',
];

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.orders);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    dispatch(getRestaurantOrders());
  }, [dispatch]);

  const handleStatusChange = (event, newValue) => {
    setSelectedStatus(newValue);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setStatusNote('');
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await dispatch(
        updateOrderStatus({
          orderId: selectedOrder._id,
          status: newStatus,
          note: statusNote,
        })
      ).unwrap();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusIndex = orderStatuses.indexOf(currentStatus);
    return orderStatuses[statusIndex + 1] || currentStatus;
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

  const filteredOrders = orders.filter(
    (order) => selectedStatus === 'all' || order.orderStatus === selectedStatus
  );

  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
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
              <Typography variant="h6">Order #{order._id.slice(-6)}</Typography>
              <Chip
                label={formatStatus(order.orderStatus)}
                color={getStatusColor(order.orderStatus)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Items:
              </Typography>
              {order.items.map((item, index) => (
                <Typography key={index} variant="body2">
                  {item.quantity}x {item.name}
                  {item.specialInstructions && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ ml: 2 }}
                    >
                      Note: {item.specialInstructions}
                    </Typography>
                  )}
                </Typography>
              ))}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Customer Details:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{order.user.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{order.user.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Order Summary
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">
                  ${order.subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="body2">Delivery Fee:</Typography>
                <Typography variant="body2">
                  ${order.deliveryFee.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">${order.tax.toFixed(2)}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: 1,
                  borderColor: 'grey.300',
                  pt: 1,
                  mt: 1,
                }}
              >
                <Typography variant="subtitle2">Total:</Typography>
                <Typography variant="subtitle2">
                  ${order.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimeIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {order.orderStatus !== 'delivered' &&
              order.orderStatus !== 'cancelled' && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpenDialog(order)}
                >
                  Update Status
                </Button>
              )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order Management
        </Typography>

        <Tabs
          value={selectedStatus}
          onChange={handleStatusChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {orderStatuses.map((status) => (
            <Tab
              key={status}
              label={formatStatus(status)}
              value={status}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No orders found
              </Typography>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Current Status: {formatStatus(selectedOrder?.orderStatus || '')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Next Status:{' '}
              {formatStatus(getNextStatus(selectedOrder?.orderStatus || ''))}
            </Typography>
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
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() =>
                handleUpdateStatus(getNextStatus(selectedOrder?.orderStatus))
              }
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrderManagement;
