import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(
      { body: req.body, query: req.query, params: req.params },
      { abortEarly: false }
    );

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

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
