import { Document, Types } from "mongoose";

export interface Product extends Document {
  name: string;
  sku: string;
  brand: string;
  unitsPerCase: number;
  pricePerCase: number;
}

export interface Brand extends Document {
  name: string;
  minOrderValue: number;
}

export interface CartItem {
  productId: Types.ObjectId;
  sku: string;
  brand: string;
  numberOfCases: number;
  pricePerCase: number;
  unitsPerCase: number;
}

export interface Cart extends Document {
  userId: string;
  items: CartItem[];
  hasReturnPolicy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  subtotal: number;
  returnPolicyFee: number;
  total: number;
  itemsByBrand: {
    [brand: string]: {
      items: CartItem[];
      subtotal: number;
      meetsMinimumOrder: boolean;
    };
  };
  meetsPlatformMinimumOrder: boolean;
}
