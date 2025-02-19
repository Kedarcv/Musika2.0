import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import { getRestaurants } from '../../store/slices/restaurantSlice';

// Default restaurant image by cuisine type
const defaultImages = {
  Italian: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=500',
  Japanese: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=500',
  American: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
  Mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
};

const getDefaultImage = (cuisines) => {
  if (!cuisines || cuisines.length === 0) return defaultImages.default;
  const primaryCuisine = cuisines[0];
  return defaultImages[primaryCuisine] || defaultImages.default;
};

const RestaurantList = () => {
  const dispatch = useDispatch();
  const { restaurants, isLoading } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Restaurants
      </Typography>
      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
            <Card
              component={Link}
              to={`/restaurants/${restaurant._id}`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={restaurant.images?.cover || getDefaultImage(restaurant.cuisine)}
                alt={restaurant.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {restaurant.name}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({restaurant.totalRatings || 0})
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                  {restaurant.cuisine.map((type, index) => (
                    <Chip
                      key={index}
                      label={type}
                      size="small"
                      sx={{ marginBottom: 0.5 }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {restaurant.address.street}, {restaurant.address.city}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {restaurant.isOpen ? (
                    <Chip label="Open" color="success" size="small" />
                  ) : (
                    <Chip label="Closed" color="error" size="small" />
                  )}
                  {restaurant.preparationTime && (
                    <Chip
                      label={`${restaurant.preparationTime} min`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {restaurant.minimumOrder && (
                    <Chip
                      label={`Min $${restaurant.minimumOrder}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  <Chip
                    label={`Delivery $${restaurant.deliveryFee}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RestaurantList;
