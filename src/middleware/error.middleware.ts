import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastError = (err: mongoose.Error.CastError) => {
  const message = `Invalid ID: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = errors.join('. ');
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  const message = field === 'name' ? 'Brand name already exists' : 'SKU already exists';
  return new AppError(message, 400);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Convert Mongoose errors to AppError
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err);
  } else if (err instanceof Error) {
    // Handle custom errors (including those from model post hooks)
    error = new AppError(err.message, error.statusCode);
  }

  // Ensure error response follows consistent format
  res.status(error.statusCode).json({
    success: false,
    error: error.message
  });
};
