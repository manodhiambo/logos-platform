import { Response } from 'express';

// Legacy function names for backward compatibility
export const successResponse = (
  res: Response,
  message: string = 'Success',
  data: any = null,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Error occurred',
  statusCode: number = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(errors && { details: errors }),
    },
  });
};

// New function names (same functionality)
export const sendSuccess = successResponse;
export const sendError = errorResponse;

export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  },
  message: string = 'Success'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
