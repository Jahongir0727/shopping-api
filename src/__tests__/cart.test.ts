import request from 'supertest';
import { app } from '../index';
import { Brand } from '../models/brand.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';
import { Cart } from '../models/cart.model';
import { IProduct } from '../models/product.model';

describe('Cart Controller', () => {
  let brandId: string;
  let productId: string;
  const userId = 'testuser123';

  beforeEach(async () => {
    // Create a test brand
    const brand = await Brand.create({
      name: 'Test Brand',
      description: 'Test Brand Description',
      minimumOrderValue: 500,
      riskFreeReturnPremium: 10
    }) as mongoose.Document & { _id: mongoose.Types.ObjectId };
    brandId = brand._id.toString();

    // Create a test product
    const product = await Product.create({
      name: 'Test Product',
      description: 'Test Product Description',
      sku: 'TEST-SKU-001',
      brand: brand._id,
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
    }) as mongoose.Document & { _id: mongoose.Types.ObjectId };
    productId = product._id.toString();

    // Create an empty cart for the user
    await Cart.create({ userId, items: [] });
  });

  describe('Basic Cart Operations', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6, // Must be multiple of unitsPerCase
          hasRiskFreeReturn: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].quantity).toBe(6);
    });

    it('should not add item with invalid quantity', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 5, // Not a multiple of unitsPerCase (6)
          hasRiskFreeReturn: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Quantity must be a multiple of case size (6)');
    });

    it('should update item quantity in cart', async () => {
      // First add item
      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6,
          hasRiskFreeReturn: false
        });

      // Then update quantity
      const response = await request(app)
        .put(`/api/cart/${userId}/items/${productId}`)
        .send({
          quantity: 12,
          hasRiskFreeReturn: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(12);
    });

    it('should remove item from cart', async () => {
      // First add item
      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6,
          hasRiskFreeReturn: false
        });

      // Then remove it
      const response = await request(app)
        .delete(`/api/cart/${userId}/items/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
    });
  });

  describe('Cart Validation', () => {
    it('should not exceed 100 SKUs limit', async () => {
      // First create 100 different products and add them to cart
      const products: mongoose.Document<unknown, {}, IProduct>[] = [];
      for (let i = 0; i < 100; i++) {
        const product = await Product.create({
          name: `Test Product ${i}`,
          description: 'Test Product Description',
          sku: `TEST-SKU-${String(i + 1000).padStart(4, '0')}`,
          brand: brandId,
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
        });
        products.push(product);
        await request(app)
          .post('/api/cart')
          .send({
            userId,
            productId: product._id,
            quantity: 6,
            hasRiskFreeReturn: false
          });
      }

      // Try to add one more product
      const response = await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6,
          hasRiskFreeReturn: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cart cannot contain more than 100 SKUs');
    });

    it('should validate minimum order value for brand', async () => {
      // Add item with value less than minimum order value
      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6, // Total value: 300 (6 * 50)
          hasRiskFreeReturn: false
        });

      const response = await request(app)
        .post(`/api/cart/${userId}/checkout/${brandId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('does not meet minimum order value');
    });
  });

  describe('Advanced Cart Features', () => {
    it('should calculate risk-free return premium correctly', async () => {
      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6, // Total value: 300 (6 * 50)
          hasRiskFreeReturn: true
        });

      const response = await request(app)
        .get(`/api/cart/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskFreeReturnPremium).toBe(30); // 10% of 300
    });

    it('should handle partial brand checkout', async () => {
      // Create another brand and product
      const brand2 = await Brand.create({
        name: 'Test Brand 2',
        description: 'Test Brand Description 2',
        minimumOrderValue: 50,
        riskFreeReturnPremium: 5
      });

      const product2 = await Product.create({
        name: 'Test Product 2',
        description: 'Test Product Description 2',
        sku: 'TEST-SKU-002',
        brand: brand2._id,
        pricePerUnit: 25,
        unitsPerCase: 6,
        weight: 0.5,
        dimensions: {
          length: 10,
          width: 10,
          height: 10
        },
        msrp: 30,
        stockQuantity: 100
      });

      // Add items from both brands
      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId,
          quantity: 6, // 300 total for brand 1
          hasRiskFreeReturn: false
        });

      await request(app)
        .post('/api/cart')
        .send({
          userId,
          productId: product2._id,
          quantity: 12, // 300 total for brand 2
          hasRiskFreeReturn: false
        });

      // Checkout items from brand 2
      const response = await request(app)
        .post(`/api/cart/${userId}/checkout/${brand2._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify remaining items are only from brand 1
      const cartResponse = await request(app)
        .get(`/api/cart/${userId}`);
      
      expect(cartResponse.body.data.items).toHaveLength(1);
      expect(cartResponse.body.data.items[0].product._id.toString()).toBe(productId);
    });
  });
});
