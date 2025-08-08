import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Brand } from '../models/brand.model';
import { Product } from '../models/product.model';
import { connectDB, disconnectDB } from '../config/database';

dotenv.config();

const brands = [
  {
    name: "The Ordinary",
    minimumOrderValue: 200.00,
    riskFreeReturnPremium: 20,
    description: "Affordable, science-backed skincare focusing on single-ingredient solutions"
  },
  {
    name: "Summer Fridays",
    minimumOrderValue: 300.00,
    riskFreeReturnPremium: 20,
    description: "Clean beauty, Instagram-famous masks focusing on hydrating treatments"
  },
  {
    name: "Drunk Elephant",
    minimumOrderValue: 500.00,
    riskFreeReturnPremium: 20,
    description: "Clean clinical skincare focusing on biocompatible ingredients"
  },
  {
    name: "Glow Recipe",
    minimumOrderValue: 400.00,
    riskFreeReturnPremium: 20,
    description: "Fruit-powered Korean beauty focusing on gentle, effective formulations"
  },
  {
    name: "Youth To The People",
    minimumOrderValue: 350.00,
    riskFreeReturnPremium: 20,
    description: "Superfood skincare focusing on vegan, sustainable formulas"
  }
];

async function seedData() {
  try {
    // Connect to MongoDB using the shared configuration
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data...');

    // Insert brands
    const createdBrands = await Brand.insertMany(brands);
    console.log('Brands created...');

    // Create a map of brand names to their IDs
    const brandMap = new Map(createdBrands.map(brand => [brand.name, brand._id]));

    // Products data with brand references
    const products = [
      {
        name: "Niacinamide 10% + Zinc 1%",
        sku: "TO-NZ-001",
        brand: brandMap.get("The Ordinary"),
        pricePerUnit: 5.99,
        unitsPerCase: 12,
        msrp: 7.99,
        weight: 0.2,
        dimensions: { length: 3, width: 3, height: 10 }
      },
      {
        name: "Hyaluronic Acid 2% + B5",
        sku: "TO-HA-001",
        brand: brandMap.get("The Ordinary"),
        pricePerUnit: 6.99,
        unitsPerCase: 12,
        msrp: 8.99,
        weight: 0.2,
        dimensions: { length: 3, width: 3, height: 10 }
      },
      {
        name: "Jet Lag Mask",
        sku: "SF-JLM-001",
        brand: brandMap.get("Summer Fridays"),
        pricePerUnit: 39.99,
        unitsPerCase: 6,
        msrp: 49.99,
        weight: 0.3,
        dimensions: { length: 4, width: 4, height: 15 }
      },
      {
        name: "Cloud Dew Oil-Free Gel Cream",
        sku: "SF-CD-001",
        brand: brandMap.get("Summer Fridays"),
        pricePerUnit: 35.99,
        unitsPerCase: 6,
        msrp: 44.99,
        weight: 0.25,
        dimensions: { length: 5, width: 5, height: 5 }
      },
      {
        name: "Protini Polypeptide Cream",
        sku: "DE-PP-001",
        brand: brandMap.get("Drunk Elephant"),
        pricePerUnit: 55.99,
        unitsPerCase: 4,
        msrp: 68.99,
        weight: 0.15,
        dimensions: { length: 6, width: 6, height: 6 }
      },
      {
        name: "C-Firma Fresh Day Serum",
        sku: "DE-CF-001",
        brand: brandMap.get("Drunk Elephant"),
        pricePerUnit: 65.99,
        unitsPerCase: 4,
        msrp: 78.99,
        weight: 0.12,
        dimensions: { length: 4, width: 4, height: 12 }
      },
      {
        name: "Watermelon Glow PHA+BHA Pore-Tight Toner",
        sku: "GR-WT-001",
        brand: brandMap.get("Glow Recipe"),
        pricePerUnit: 28.99,
        unitsPerCase: 8,
        msrp: 34.99,
        weight: 0.25,
        dimensions: { length: 4, width: 4, height: 14 }
      },
      {
        name: "Plum Plump Hyaluronic Serum",
        sku: "GR-PH-001",
        brand: brandMap.get("Glow Recipe"),
        pricePerUnit: 32.99,
        unitsPerCase: 8,
        msrp: 42.99,
        weight: 0.2,
        dimensions: { length: 4, width: 4, height: 12 }
      },
      {
        name: "Superfood Cleanser",
        sku: "YP-SC-001",
        brand: brandMap.get("Youth To The People"),
        pricePerUnit: 29.99,
        unitsPerCase: 6,
        msrp: 36.99,
        weight: 0.24,
        dimensions: { length: 5, width: 5, height: 15 }
      },
      {
        name: "Adaptogen Deep Moisture Cream",
        sku: "YP-AD-001",
        brand: brandMap.get("Youth To The People"),
        pricePerUnit: 45.99,
        unitsPerCase: 6,
        msrp: 58.99,
        weight: 0.2,
        dimensions: { length: 6, width: 6, height: 6 }
      }
    ];

    // Insert products
    await Product.insertMany(products);
    console.log('Products created...');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    // Disconnect after seeding
    await disconnectDB();
  }
}

seedData(); 