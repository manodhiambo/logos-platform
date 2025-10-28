import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(
      { body: req.body, query: req.query, params: req.params },
      { 
        abortEarly: false,
        allowUnknown: true,  // Allow unknown keys
        stripUnknown: false  // Don't strip them
      }
    );

    if (error) {
      const details = error.details
        .filter(detail => {
          // Only report errors from body, not query/params if they're empty
          const path = detail.path[0];
          if (path === 'query' && Object.keys(req.query).length === 0) return false;
          if (path === 'params' && Object.keys(req.params).length === 0) return false;
          return true;
        })
        .map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

      if (details.length === 0) {
        return next();
      }

      return res.status(400).json({
        success: false,
        status: 'fail',
        error: {
          message: 'Validation failed',
          details,
        },
      });
    }

    next();
  };
};
