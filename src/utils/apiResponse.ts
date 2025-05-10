import { Response } from "express";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export const sendSuccessResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  error: any = null,
  statusCode: number = 500
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
