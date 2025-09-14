// backend/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';
import { logger } from '../config/logger';

/**
 * validateBody(schema) - middleware factory to validate req.body using a Zod schema.
 * - If req.body is undefined, treat as {} so validator doesn't crash.
 * - On validation failure, respond with 400 and a normalized errors array.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Treat undefined body as an empty object to avoid runtime errors
      const rawBody = req.body ?? {};

      const result = schema.safeParse(rawBody);
      if (!result.success) {
        const details = result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details,
          },
        });
      }

      // Replace req.body with the parsed/coerced data
      req.body = result.data as any;
      return next();
    } catch (error) {
      logger.error('Validation error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  };
}

/**
 * validateQuery(schema) - validate req.query
 */
export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawQuery = req.query ?? {};

      const result = schema.safeParse(rawQuery);
      if (!result.success) {
        const details = result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details,
          },
        });
      }

      req.query = result.data as any;
      return next();
    } catch (error) {
      logger.error('Query validation error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  };
}

/**
 * validateParams(schema) - validate req.params
 */
export function validateParams(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawParams = req.params ?? {};

      const result = schema.safeParse(rawParams);
      if (!result.success) {
        const details = result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid URL parameters',
            details,
          },
        });
      }

      req.params = result.data as any;
      return next();
    } catch (error) {
      logger.error('Params validation error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    }
  };
}
