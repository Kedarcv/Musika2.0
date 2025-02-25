import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, Typography } from '@mui/material';

const RestaurantList = () => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      // Simulate data fetching
      setTimeout(() => {
        setRestaurants(['Restaurant A', 'Restaurant B', 'Restaurant C']);
        setLoading(false);
      }, 2000);
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography variant="h6">Loading Restaurants...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4">Available Restaurants</Typography>
      <ul>
        {restaurants.map((restaurant, index) => (
          <li key={index}>{restaurant}</li>
        ))}
      </ul>
    </Container>
  );
};

export default RestaurantList;
