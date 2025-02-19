import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ total, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (paymentMethod === 'cash') {
      onPaymentComplete({
        method: 'cash',
        status: 'pending',
      });
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      onPaymentComplete({
        method: 'card',
        status: 'completed',
        transactionId: paymentIntent.id,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="card"
              control={<Radio />}
              label="Pay with Card"
            />
            <FormControlLabel
              value="cash"
              control={<Radio />}
              label="Cash on Delivery"
            />
          </RadioGroup>
        </FormControl>

        {paymentMethod === 'card' && (
          <Box sx={{ mb: 3 }}>
            <PaymentElement />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Total: ${total.toFixed(2)}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (!stripe && paymentMethod === 'card')}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PaymentForm;
