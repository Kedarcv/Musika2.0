const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  assignRider,
  rateOrder,
  updateOrderPayment,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.use(protect);

// Order routes
router.route('/')
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrderStatus);

router.route('/:id/assign-rider')
  .put(assignRider);

router.route('/:id/rate')
  .post(rateOrder);

router.route('/:id/payment')
  .put(updateOrderPayment);

module.exports = router;
