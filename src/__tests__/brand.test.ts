import request from 'supertest';
import { app } from '../index';
import { Brand } from '../models/brand.model';
import mongoose from 'mongoose';

describe('Brand API', () => {
  const sampleBrand = {
    name: 'Test Brand',
    description: 'Test Brand Description',
    minimumOrderValue: 100,
    riskFreeReturnPremium: 10,
    country: 'Test Country'
  };

  describe('POST /api/brands', () => {
    it('should create a new brand', async () => {
      const response = await request(app)
        .post('/api/brands')
        .send(sampleBrand);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(sampleBrand.name);
      expect(response.body.data.minimumOrderValue).toBe(sampleBrand.minimumOrderValue);
      expect(response.body.data.riskFreeReturnPremium).toBe(sampleBrand.riskFreeReturnPremium);
    });

    it('should not allow duplicate brand names', async () => {
      // First create a brand
      await Brand.create(sampleBrand);

      // Try to create another brand with the same name
      const response = await request(app)
        .post('/api/brands')
        .send(sampleBrand);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should validate minimum order value', async () => {
      const response = await request(app)
        .post('/api/brands')
        .send({
          ...sampleBrand,
          minimumOrderValue: -1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be at least 0');
    });
  });

  describe('GET /api/brands', () => {
    it('should return all brands', async () => {
      await Brand.create(sampleBrand);
      const response = await request(app).get('/api/brands');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(sampleBrand.name);
    });

    it('should return empty array when no brands exist', async () => {
      const response = await request(app).get('/api/brands');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/brands/:id', () => {
    it('should return a specific brand', async () => {
      const brand = await Brand.create(sampleBrand);
      const response = await request(app).get(`/api/brands/${brand._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(sampleBrand.name);
    });

    it('should return 404 for non-existent brand', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/brands/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Brand not found');
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app).get('/api/brands/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid ID');
    });
  });
});
