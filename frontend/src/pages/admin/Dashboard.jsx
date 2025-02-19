import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as RiderIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import { getSystemAnalytics, resetAnalytics } from '../../store/slices/adminSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, isLoading, isError, message } = useSelector((state) => state.admin);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    dispatch(getSystemAnalytics(dateRange));
    return () => {
      dispatch(resetAnalytics());
    };
  }, [dispatch, dateRange]);

  const handleDateChange = (e) => {
    setDateRange((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRefresh = () => {
    dispatch(getSystemAnalytics(dateRange));
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {message}</Typography>
        <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, growth, icon, color }) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Box>
              <Typography variant="h4">{value}</Typography>
              {growth !== undefined && (
                <Typography 
                  color={growth >= 0 ? 'success.main' : 'error.main'} 
                  variant="body2"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mt: 0.5,
                    fontWeight: 'medium'
                  }}
                >
                  {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                  <Typography 
                    component="span" 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    vs previous period
                  </Typography>
                </Typography>
              )}
            </Box>
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Dashboard
        </Typography>

        {/* Date Range Selector */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleRefresh}
                  sx={{ height: '56px' }}
                >
                  Update Analytics
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                  title="Users"
                  value={analytics?.userCount || 0}
                  icon={<PeopleIcon color="primary" />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                  title="Restaurants"
                  value={analytics?.restaurantCount || 0}
                  icon={<RestaurantIcon color="secondary" />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                  title="Riders"
                  value={analytics?.riderCount || 0}
                  icon={<RiderIcon color="success" />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                  title="Orders"
                  value={analytics?.totalOrders || 0}
                  growth={analytics?.growth?.orders}
                  icon={<OrderIcon color="warning" />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard
                  title="Revenue"
                  value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
                  growth={analytics?.growth?.revenue}
                  icon={<RevenueIcon color="info" />}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              {/* Revenue & Orders Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue & Orders Overview
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics?.revenueData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Orders by Status */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Orders by Status
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics?.ordersByStatus || []}
                            dataKey="value"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {(analytics?.ordersByStatus || []).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Restaurants */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Restaurants
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.topRestaurants || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="orders" fill="#8884d8" />
                          <Bar dataKey="revenue" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* User Growth */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Growth
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics?.userGrowth || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="restaurants"
                            stroke="#82ca9d"
                          />
                          <Line
                            type="monotone"
                            dataKey="riders"
                            stroke="#ffc658"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
