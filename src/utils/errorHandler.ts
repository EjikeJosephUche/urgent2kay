import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler to automatically catch and forward errors to Express error middleware
 * 
 * @param fn - Async Express route handler function
 * @returns RequestHandler that will catch and forward any errors to Express error middleware
 */
export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

/**
 * Global error handler middleware for Express
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Custom error class with status code support for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Helper function to check if a user is authorized for a specific resource
 * @param userId - ID of the current user
 * @param resourceOwnerId - ID of the resource owner to compare against
 * @throws ApiError if user is not authorized
 */
export const checkAuthorization = (userId: string, resourceOwnerId: string) => {
  if (userId !== resourceOwnerId) {
    throw new ApiError('Not authorized to access this resource', 403);
  }
};