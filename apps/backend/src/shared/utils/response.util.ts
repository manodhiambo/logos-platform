import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
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
