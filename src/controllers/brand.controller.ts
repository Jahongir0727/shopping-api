import { Request, Response, NextFunction } from 'express';
import { Brand } from '../models/brand.model';
import { AppError } from '../middleware/error.middleware';

export const getBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }
    res.status(200).json({
      success: true,
      data: brand
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

export const createBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Brand name already exists'
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
