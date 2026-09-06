import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Array<{ field: string; message: string }>;
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: ApiResponse["pagination"]
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Array<{ field: string; message: string }>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};