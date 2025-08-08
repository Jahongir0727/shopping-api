# Shopping Cart API

A RESTful API for managing a shopping cart with features like product management, cart operations, and brand-specific checkout functionality. This API is specifically designed for beauty and skincare products with support for case-based quantities and risk-free returns.

- Case quantity enforcement (products must be ordered in full cases)
- 60-day risk-free returns with 20% premium
- Brand-specific minimum order values
- Platform-wide minimum order value ($2,000)
- Partial checkout by brand
- Cart limit of 100 SKUs
- Cost breakdown including risk-free return fees
- Products grouped by brand

## Tech Stack

- Node.js (18+)
- Express.js
- TypeScript
- MongoDB
- Jest for testing
- Docker

## Prerequisites

- Node.js 18+
- MongoDB (or Docker for containerized setup)
- npm or yarn

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shopping-cart-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/shopping-cart
   PLATFORM_MIN_ORDER_VALUE=2000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Cart Operations
- `GET /api/cart/:userId` - Get cart contents with brand grouping and cost breakdown
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:userId/items/:productId` - Update cart item quantity or risk-free return status
- `DELETE /api/cart/:userId/items/:productId` - Remove item from cart
- `POST /api/cart/:userId/checkout/:brandId` - Checkout items by brand

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product

### Brands
- `GET /api/brands` - List all brands
- `GET /api/brands/:id` - Get brand details
- `POST /api/brands` - Create brand

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Server Error

Error response format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

2. Clean and seed the database with sample data:
```bash
npm run clean-db
npm run seed-db
```

## Manual Testing Guide

### 1. Database Setup
```bash
# Clean the database
npm run clean-db

# Seed with sample data
npm run seed-db
```

### 2. Testing Cart Features

1. **Case Quantity Validation**
```bash
# Get a product ID first
curl http://localhost:3000/api/products

# Try invalid quantity (should fail)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "PRODUCT_ID",
    "quantity": 5,
    "hasRiskFreeReturn": false
  }'

# Try valid quantity (should succeed)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "PRODUCT_ID",
    "quantity": 12,
    "hasRiskFreeReturn": false
  }'
```

2. **Risk-Free Return Premium**
```bash
# Add item with risk-free return
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "PRODUCT_ID",
    "quantity": 12,
    "hasRiskFreeReturn": true
  }'

# View cart to verify 20% premium
curl http://localhost:3000/api/cart/test123
```

3. **Brand Minimum Order Values**
```bash
# Get brand IDs
curl http://localhost:3000/api/brands

# Add items below minimum
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "PRODUCT_ID",
    "quantity": 12,
    "hasRiskFreeReturn": false
  }'

# Try checkout (should fail)
curl -X POST http://localhost:3000/api/cart/test123/checkout/BRAND_ID

# Add more items to reach minimum
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "PRODUCT_ID",
    "quantity": 36,
    "hasRiskFreeReturn": false
  }'

# Try checkout again (should succeed)
curl -X POST http://localhost:3000/api/cart/test123/checkout/BRAND_ID
```

4. **Platform Minimum Order Value**
```bash
# View cart to check platform minimum status
curl http://localhost:3000/api/cart/test123
```

5. **Partial Brand Checkout**
```bash
# Add items from multiple brands
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "ORDINARY_PRODUCT_ID",
    "quantity": 24,
    "hasRiskFreeReturn": false
  }'

curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "productId": "DRUNK_ELEPHANT_PRODUCT_ID",
    "quantity": 8,
    "hasRiskFreeReturn": true
  }'

# Checkout single brand
curl -X POST http://localhost:3000/api/cart/test123/checkout/ORDINARY_BRAND_ID
```

6. **Update Case Quantities**
```bash
# Update quantity for a SKU
curl -X PUT http://localhost:3000/api/cart/test123/items/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 24,
    "hasRiskFreeReturn": false
  }'
```

7. **Remove SKU from Cart**
```bash
# Remove a product
curl -X DELETE http://localhost:3000/api/cart/test123/items/PRODUCT_ID
```

### Expected Responses

1. **Cart Contents Response**
```json
{
  "data": {
    "brandGroups": [
      {
        "brandId": "BRAND_ID",
        "brandName": "The Ordinary",
        "items": [
          {
            "productId": "PRODUCT_ID",
            "name": "Niacinamide",
            "quantity": 24,
            "basePrice": 143.76,
            "riskFreePremium": 28.75,
            "totalPrice": 172.51
          }
        ],
        "subtotal": 143.76,
        "riskFreePremium": 28.75,
        "total": 172.51,
        "reachesMinimum": true
      }
    ],
    "totalOrderAmount": 172.51,
    "reachesPlatformMinimum": false,
    "remainingForPlatformMinimum": 1827.49
  }
}
```

2. **Error Responses**
```json
{
  "status": "error",
  "message": "Quantity must be a multiple of case size (12)"
}
```
```json
{
  "status": "error",
  "message": "Brand minimum order value not met. Required: $200.00, Current: $143.76"
}
```
```json
{
  "status": "error",
  "message": "Cart cannot contain more than 100 SKUs"
}
```

## Docker Support

1. Build and start containers:
```bash
docker-compose up --build
```

2. Stop containers:
```bash
docker-compose down
```
