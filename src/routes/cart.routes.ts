import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  checkoutByBrand
} from '../controllers/cart.controller';

const router = express.Router();

// Get cart
router.get('/:userId', getCart);

// Add item to cart
router.post('/', addToCart);

// Update cart item
router.put('/:userId/items/:productId', updateCartItem);

// Remove item from cart
router.delete('/:userId/items/:productId', removeFromCart);

// Checkout by brand
router.post('/:userId/checkout/:brandId', checkoutByBrand);

export default router;
