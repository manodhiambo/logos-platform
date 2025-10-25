import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './error-handler.middleware';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const appError = new AppError('Validation failed', 400);
      (appError as any).details = errors;
      return next(appError);
    }

    // Replace request with validated values
    req.body = value.body;
    req.query = value.query;
    req.params = value.params;

    next();
  };
};
