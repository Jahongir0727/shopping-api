import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/error.middleware';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find().populate('brand');
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid ID: ${req.params.id}`
      });
    }
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists'
        });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values((error as any).errors).map((err: any) => err.message);
        return res.status(400).json({
          success: false,
          error: messages.join('. ')
        });
      }
    }
    next(error);
  }
};

export const getProductsByBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({ brand: req.params.brandId }).populate('brand');
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
