import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, Typography } from '@mui/material';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      // Simulate data fetching
      setTimeout(() => {
        setCartItems(['Item 1', 'Item 2', 'Item 3']);
        setLoading(false);
      }, 2000);
    };

    fetchCartItems();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography variant="h6">Loading Cart...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4">Your Cart</Typography>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </Container>
  );
};

export default Cart;
