import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import brandRoutes from "./routes/brand.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/brands", brandRoutes);

// Error handling
app.use(errorHandler);

// Only start the server if this file is run directly
if (require.main === module) {
  // Connect to database and start server
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

export { app };
