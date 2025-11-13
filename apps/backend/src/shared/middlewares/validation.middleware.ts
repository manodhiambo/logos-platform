import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import Joi from 'joi';
import { AppError } from './error-handler.middleware';
import { logger } from '../utils/logger.util';

// Express-validator validation middleware (for arrays of validation chains)
export const validate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
    }));
    
    logger.error('Validation errors:', formattedErrors);
    
    const appError = new AppError('Validation failed', 400);
    (appError as any).details = formattedErrors;
    return next(appError);
  }
  next();
};

// Joi validation middleware (for Joi schemas - used by auth routes)
export const validateWithJoi = (schema: Joi.ObjectSchema): RequestHandler => {
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
      
      // Log the validation errors with the request body
      logger.error('Joi validation failed:', {
        errors,
        requestBody: req.body,
        requestQuery: req.query,
        requestParams: req.params,
      });
      
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

// Export both for backward compatibility
export { validateWithJoi as validateJoi };
