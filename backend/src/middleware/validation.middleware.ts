import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { errorResponse } from "../utils/apiResponse";

export const validate = (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) {
        Object.defineProperty(req, "query", { value: parsed.query, writable: true, configurable: true, enumerable: true });
      }
      if (parsed.params !== undefined) {
        Object.defineProperty(req, "params", { value: parsed.params, writable: true, configurable: true, enumerable: true });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        errorResponse(res, "Validation failed", 400, error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })));
        return;
      }
      next(error);
    }
  };
