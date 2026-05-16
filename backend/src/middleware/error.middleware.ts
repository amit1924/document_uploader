import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import mongoose from 'mongoose';
import config from '../config';
import { ApiError } from '../utils/ApiError';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
  stack?: string;
}

const handleZodError = (err: ZodError): ApiError => {
  const errors = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return ApiError.badRequest('Validation failed', errors);
};

const handleMulterError = (err: MulterError): ApiError => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return ApiError.badRequest('File size exceeds the maximum allowed limit');
    case 'LIMIT_FILE_COUNT':
      return ApiError.badRequest('Too many files uploaded');
    case 'LIMIT_UNEXPECTED_FILE':
      return ApiError.badRequest('Unexpected file field');
    default:
      return ApiError.badRequest(err.message);
  }
};

const handleMongooseError = (err: mongoose.Error.ValidationError): ApiError => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return ApiError.badRequest('Validation failed', errors);
};

const handleMongooseDuplicateKey = (err: mongoose.mongo.MongoServerError): ApiError => {
  const field = Object.keys(err.keyValue)[0];
  return ApiError.conflict(`Duplicate value for ${field}. This ${field} is already in use.`);
};

const handleCastError = (err: mongoose.Error.CastError): ApiError => {
  return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
};

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = handleZodError(err);
  } else if (err instanceof MulterError) {
    apiError = handleMulterError(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    apiError = handleMongooseError(err);
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = handleCastError(err);
  } else if ((err as any)?.code === 11000) {
    apiError = handleMongooseDuplicateKey(err as mongoose.mongo.MongoServerError);
  } else if ((err as any)?.name === 'JsonWebTokenError' || (err as any)?.name === 'TokenExpiredError') {
    apiError = ApiError.unauthorized('Invalid or expired token');
  } else {
    apiError = ApiError.internal('An unexpected error occurred');
  }

  const response: ErrorResponse = {
    success: false,
    message: apiError.message,
  };

  if (apiError.errors && apiError.errors.length > 0) {
    response.errors = apiError.errors;
  }

  if (config.nodeEnv === 'development') {
    response.stack = err instanceof Error ? err.stack : undefined;
  }

  res.status(apiError.statusCode).json(response);
};


