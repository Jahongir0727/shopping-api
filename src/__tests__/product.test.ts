import request from 'supertest';
import { app } from '../index';
import { Brand } from '../models/brand.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';

describe('Product API', () => {
  let brandId: string;

  const sampleBrand = {
    name: 'Test Brand',
    description: 'Test Brand Description',
    minimumOrderValue: 100,
    riskFreeReturnPremium: 10,
    country: 'Test Country'
  };

  const sampleProduct = {
    name: 'Test Product',
    description: 'Test Product Description',
    sku: 'TEST-SKU-001',
    pricePerUnit: 50,
    unitsPerCase: 6,
    weight: 0.5,
    dimensions: {
      length: 10,
      width: 10,
      height: 10
    },
    msrp: 60,
    stockQuantity: 100
  };

  beforeEach(async () => {
    const brand = await Brand.create(sampleBrand) as mongoose.Document & { _id: mongoose.Types.ObjectId };
    brandId = brand._id.toString();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          ...sampleProduct,
          brand: brandId
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(sampleProduct.name);
      expect(response.body.data.sku).toBe(sampleProduct.sku);
    });

    it('should not allow duplicate SKUs', async () => {
      // First create a product
      await Product.create({
        ...sampleProduct,
        brand: brandId
      });

      // Try to create another product with the same SKU
      const response = await request(app)
        .post('/api/products')
        .send({
          ...sampleProduct,
          name: 'Different Product',
          brand: brandId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('SKU already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          brand: brandId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should validate units per case is positive', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          ...sampleProduct,
          brand: brandId,
          unitsPerCase: 0
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be at least 1');
    });

    it('should validate price is positive', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          ...sampleProduct,
          brand: brandId,
          pricePerUnit: -1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be at least 0');
    });
  });

  describe('GET /api/products', () => {
    it('should return all products with brand information', async () => {
      await Product.create({
        ...sampleProduct,
        brand: brandId
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].brand.name).toBe(sampleBrand.name);
    });

    it('should return empty array when no products exist', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product with brand information', async () => {
      const product = await Product.create({
        ...sampleProduct,
        brand: brandId
      });

      const response = await request(app).get(`/api/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(sampleProduct.name);
      expect(response.body.data.brand.name).toBe(sampleBrand.name);
    });

    it('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app).get('/api/products/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('GET /api/products/brand/:brandId', () => {
    it('should return all products for a specific brand', async () => {
      await Product.create({
        ...sampleProduct,
        brand: brandId
      });

      const response = await request(app).get(`/api/products/brand/${brandId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(sampleProduct.name);
    });

    it('should return empty array for brand with no products', async () => {
      const response = await request(app).get(`/api/products/brand/${brandId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });
});
