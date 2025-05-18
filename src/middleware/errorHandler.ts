import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.statusCode} - ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method
    });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.statusCode
    });
  }

  // Log detailed information for unknown errors
  logger.error('Internal Server Error:', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    code: 500
  });
}; 