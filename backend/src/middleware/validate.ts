import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { apiResponse } from '../utils/api-response';

/**
 * Validation source — which part of the request to validate.
 */
type ValidationSource = 'body' | 'query' | 'params';

/**
 * Creates middleware that validates a request field against a Zod schema.
 *
 * Usage:
 *   router.post('/users', validate(createUserSchema, 'body'), controller.create);
 *   router.get('/users', validate(listQuerySchema, 'query'), controller.list);
 *   router.get('/users/:id', validate(idParamSchema, 'params'), controller.get);
 */
export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed/coerced data
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        res.status(422).json(
          apiResponse.error(
            'Validation failed',
            422,
            'VALIDATION_ERROR',
            details
          )
        );
        return;
      }
      next(error);
    }
  };
};
