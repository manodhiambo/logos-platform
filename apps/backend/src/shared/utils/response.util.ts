import { Response } from 'express';

export const successResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
