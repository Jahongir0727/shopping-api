import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  minimumOrderValue: number;
  riskFreeReturnPremium: number;
  country?: string;
}

const brandSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true
  },
  minimumOrderValue: {
    type: Number,
    required: [true, 'Minimum order value is required'],
    min: [0, 'Minimum order value must be at least 0']
  },
  riskFreeReturnPremium: {
    type: Number,
    required: [true, 'Risk-free return premium percentage is required'],
    min: [0, 'Risk-free return premium percentage must be at least 0'],
    max: [100, 'Risk-free return premium percentage cannot exceed 100']
  },
  country: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
