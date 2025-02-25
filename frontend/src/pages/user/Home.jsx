import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, Typography } from '@mui/material';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate data fetching
      setTimeout(() => {
        setData(['Restaurant 1', 'Restaurant 2', 'Restaurant 3']);
        setLoading(false);
      }, 2000);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4">Welcome to Musika Food Delivery</Typography>
      <Typography variant="h6">Available Restaurants:</Typography>
      <ul>
        {data.map((restaurant, index) => (
          <li key={index}>{restaurant}</li>
        ))}
      </ul>
    </Container>
  );
};

export default Home;
