import express from 'express';
import { getProducts, getProductById, createProduct, getProductsByBrand } from '../controllers/product.controller';

const router = express.Router();

// Get all products
router.get('/', getProducts);

// Get products by brand
router.get('/brand/:brandId', getProductsByBrand);

// Get product by ID
router.get('/:id', getProductById);

// Create product (for testing)
router.post('/', createProduct);

export default router;
