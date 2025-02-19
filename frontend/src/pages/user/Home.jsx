import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Rating,
  Skeleton,
  Button,
  Fade,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  RestaurantMenu as MenuIcon,
  AccessTime as TimeIcon,
  LocalOffer as OfferIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { getRestaurants, searchRestaurants } from '../../store/slices/restaurantSlice';
import { getDefaultImage, getPlaceholderImage } from '../../config/defaultImages';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { restaurants, isLoading } = useSelector((state) => state.restaurants);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [loadedImages, setLoadedImages] = useState({});
  const [fadeIn, setFadeIn] = useState(false);

  const cuisineTypes = [
    'All',
    'Italian',
    'Chinese',
    'Indian',
    'Mexican',
    'Japanese',
    'Thai',
    'American',
  ];

  useEffect(() => {
    dispatch(getRestaurants());
    setFadeIn(true);
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(
      searchRestaurants({
        search: searchTerm,
        cuisine: selectedCuisine === 'All' ? '' : selectedCuisine,
      })
    );
  };

  const handleCuisineFilter = (cuisine) => {
    setSelectedCuisine(cuisine);
    dispatch(
      searchRestaurants({
        search: searchTerm,
        cuisine: cuisine === 'All' ? '' : cuisine,
      })
    );
  };

  const handleImageLoad = (restaurantId) => {
    setLoadedImages((prev) => ({ ...prev, [restaurantId]: true }));
  };

  const RestaurantCard = ({ restaurant }) => {
    const imageUrl = restaurant.images?.cover || getDefaultImage(restaurant.cuisine);
    const isImageLoaded = loadedImages[restaurant._id];

    return (
      <Fade in={fadeIn} timeout={500}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              transition: 'all 0.3s ease-in-out',
            },
          }}
          onClick={() => navigate(`/restaurants/${restaurant._id}`)}
        >
          {restaurant.isOpen && (
            <Badge
              color="success"
              badgeContent="Open"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: '24px',
                  minWidth: '44px',
                  padding: '0 8px',
                },
              }}
            />
          )}
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            {!isImageLoaded && (
              <CardMedia
                component="img"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  filter: 'blur(10px)',
                  transform: 'scale(1.1)',
                }}
                image={getPlaceholderImage(imageUrl)}
                alt={restaurant.name}
              />
            )}
            <CardMedia
              component="img"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: isImageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
              image={imageUrl}
              alt={restaurant.name}
              onLoad={() => handleImageLoad(restaurant._id)}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="div">
              {restaurant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={restaurant.rating || 0}
                readOnly
                precision={0.5}
                size="small"
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({restaurant.totalRatings || 0})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {restaurant.cuisine.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  sx={{
                    marginBottom: 0.5,
                    backgroundColor: selectedCuisine === type ? 'primary.main' : undefined,
                    color: selectedCuisine === type ? 'white' : undefined,
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {restaurant.address.city}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Tooltip title="Preparation Time">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.preparationTime} min
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Delivery Fee">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DeliveryIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    ${restaurant.deliveryFee.toFixed(2)}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Minimum Order">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <OfferIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Min ${restaurant.minimumOrder.toFixed(2)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={<MenuIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurants/${restaurant._id}`);
              }}
            >
              View Menu
            </Button>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const LoadingSkeleton = () => (
    <Fade in timeout={500}>
      <Card sx={{ height: '100%' }}>
        <Skeleton variant="rectangular" sx={{ paddingTop: '56.25%' }} />
        <CardContent>
          <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={60} height={24} />
          </Box>
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </Box>
          <Skeleton variant="rectangular" height={36} />
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 700 }}>
            Food Delivery Made Easy
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Order from your favorite local restaurants
          </Typography>
        </Box>
      </Fade>

      {/* Search Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search for restaurants or cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Cuisine Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {cuisineTypes.map((cuisine) => (
              <Chip
                key={cuisine}
                label={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                color={selectedCuisine === cuisine ? 'primary' : 'default'}
                variant={selectedCuisine === cuisine ? 'filled' : 'outlined'}
                sx={{
                  '&:hover': {
                    backgroundColor: selectedCuisine === cuisine ? 'primary.dark' : 'action.hover',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Fade>

      {/* Restaurants Grid */}
      <Grid container spacing={3}>
        {isLoading
          ? Array.from(new Array(8)).map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                <LoadingSkeleton />
              </Grid>
            ))
          : restaurants.map((restaurant) => (
              <Grid item key={restaurant._id} xs={12} sm={6} md={4} lg={3}>
                <RestaurantCard restaurant={restaurant} />
              </Grid>
            ))}
      </Grid>

      {/* No Results */}
      {!isLoading && restaurants.length === 0 && (
        <Fade in timeout={500}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 4,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No restaurants found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default Home;
