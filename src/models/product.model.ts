import mongoose, { Document, Schema } from 'mongoose';
import { IBrand } from './brand.model';

export interface IProduct extends Document {
  name: string;
  sku: string;
  brand: IBrand['_id'];
  pricePerUnit: number;
  unitsPerCase: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  msrp: number;
  stockQuantity: number;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price per unit must be at least 0']
  },
  unitsPerCase: {
    type: Number,
    required: [true, 'Units per case is required'],
    min: [1, 'Units per case must be at least 1']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be greater than 0']
  },
  dimensions: {
    length: { 
      type: Number, 
      required: [true, 'Length is required'],
      min: [0, 'Length must be greater than 0']
    },
    width: { 
      type: Number, 
      required: [true, 'Width is required'],
      min: [0, 'Width must be greater than 0']
    },
    height: { 
      type: Number, 
      required: [true, 'Height is required'],
      min: [0, 'Height must be greater than 0']
    }
  },
  msrp: {
    type: Number,
    required: [true, 'MSRP is required'],
    min: [0, 'MSRP must be greater than 0']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity must be at least 0'],
    default: 0
  }
}, {
  timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
