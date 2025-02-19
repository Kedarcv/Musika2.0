import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocalOffer as OfferIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  getRestaurantById,
  getRestaurantMenu,
} from '../../store/slices/restaurantSlice';
import { addItem } from '../../store/slices/cartSlice';

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedRestaurant, menu, isLoading } = useSelector(
    (state) => state.restaurants
  );
  const { restaurant: cartRestaurant } = useSelector((state) => state.cart);

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [itemQuantities, setItemQuantities] = useState({});
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getRestaurantById(id));
      dispatch(getRestaurantMenu(id));
    }
  }, [dispatch, id]);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleQuantityChange = (itemId, change) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change),
    }));
  };

  const handleAddToCart = (item) => {
    if (cartRestaurant && cartRestaurant.id !== id) {
      // Show warning about clearing cart
      if (
        !window.confirm(
          'Adding items from a different restaurant will clear your current cart. Continue?'
        )
      ) {
        return;
      }
    }

    dispatch(
      addItem({
        item: {
          ...item,
          specialInstructions,
        },
        restaurantId: id,
        restaurantName: selectedRestaurant.name,
      })
    );
    setOpenItemDialog(false);
    setSelectedItem(null);
    setSpecialInstructions('');
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenItemDialog(true);
  };

  const categories = menu.reduce((acc, item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);

  const MenuItemCard = ({ item }) => (
    <Card
      sx={{
        display: 'flex',
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
        },
      }}
      onClick={() => handleItemClick(item)}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          {item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.description}
        </Typography>
        <Typography variant="h6" color="primary">
          ${item.price.toFixed(2)}
        </Typography>
      </CardContent>
      {item.image && (
        <CardMedia
          component="img"
          sx={{ width: 151 }}
          image={item.image}
          alt={item.name}
        />
      )}
    </Card>
  );

  if (isLoading || !selectedRestaurant) {
    return (
      <Container>
        <Box sx={{ pt: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} key={index}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ pt: 3 }}>
        {/* Restaurant Header */}
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            height="200"
            image={selectedRestaurant.image || '/default-restaurant.jpg'}
            alt={selectedRestaurant.name}
          />
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {selectedRestaurant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={selectedRestaurant.rating}
                readOnly
                precision={0.5}
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({selectedRestaurant.totalRatings} ratings)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedRestaurant.cuisine.map((type) => (
                <Chip key={type} label={type} />
              ))}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Delivery: 30-45 minutes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <OfferIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Minimum order: ${selectedRestaurant.minimumOrder}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Delivery fee: ${selectedRestaurant.deliveryFee}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Menu Categories */}
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {categories.map((category, index) => (
            <Tab key={category} label={category} value={index} />
          ))}
        </Tabs>

        {/* Menu Items */}
        <Box>
          {menu
            .filter((item) => item.category === categories[selectedCategory])
            .map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
        </Box>

        {/* Item Dialog */}
        <Dialog
          open={openItemDialog}
          onClose={() => setOpenItemDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedItem && (
            <>
              <DialogTitle>{selectedItem.name}</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedItem.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${selectedItem.price.toFixed(2)}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Special Instructions (Optional)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={() => handleAddToCart(selectedItem)}
                >
                  Add to Cart
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default RestaurantDetail;
