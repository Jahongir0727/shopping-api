import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './product.model';

interface CartItem {
  product: IProduct['_id'];
  quantity: number;
  hasRiskFreeReturn: boolean;
}

export interface ICart extends Document {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    hasRiskFreeReturn: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Middleware to ensure cart doesn't exceed 100 SKUs
cartSchema.pre('save', function(next) {
  if (this.items.length > 100) {
    next(new Error('Cart cannot contain more than 100 SKUs'));
  } else {
    next();
  }
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
