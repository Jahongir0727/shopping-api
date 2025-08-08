import express from 'express';
import { getBrands, getBrandById, createBrand } from '../controllers/brand.controller';

const router = express.Router();

// Get all brands
router.get('/', getBrands);

// Get brand by ID
router.get('/:id', getBrandById);

// Create brand (for testing)
router.post('/', createBrand);

export default router;
