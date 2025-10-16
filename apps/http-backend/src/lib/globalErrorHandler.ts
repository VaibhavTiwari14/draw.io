import type { ErrorRequestHandler } from "express";
import { StatusCodes, ErrorCode } from "@repo/common/enums";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

function normalizeError(err: unknown): ApiError {
  // Already an ApiError
  if (err instanceof ApiError) return err;

  // Zod validation errors
  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    (err as any).name === "ZodError"
  ) {
    const zodErr = err as any;
    const details = Array.isArray(zodErr.errors)
      ? zodErr.errors.map((e: any) => ({ path: e.path, message: e.message }))
      : undefined;

    return new ApiError({
      statusCode: StatusCodes.BadRequest,
      message: "Validation failed",
      details,
      code: ErrorCode.VALIDATION_ERROR,
      isOperational: true,
    });
  }

  // Mongoose / Prisma validation errors
  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    (err as any).name === "ValidationError"
  ) {
    const validationErr = err as any;
    const details = validationErr.errors
      ? Object.values(validationErr.errors).map((e: any) => e.message)
      : undefined;

    return new ApiError({
      statusCode: StatusCodes.BadRequest,
      message: details ? details.join(", ") : "Validation error",
      details,
      code: ErrorCode.DB_QUERY_FAILED,
      isOperational: true,
    });
  }

  // JWT errors
  if (err && typeof err === "object" && "name" in err) {
    const eName = (err as any).name;
    if (eName === "JsonWebTokenError" || eName === "TokenExpiredError") {
      return new ApiError({
        statusCode: StatusCodes.Unauthorized,
        message: "Invalid or expired token",
        code: ErrorCode.INVALID_TOKEN,
        isOperational: true,
      });
    }
  }

  // Fallback for unknown errors
  const message =
    err && typeof err === "object" && "message" in err
      ? (err as any).message
      : "Internal Server Error";
  const statusCode =
    err && typeof err === "object" && "statusCode" in err
      ? (err as any).statusCode
      : StatusCodes.InternalServerError;

  return new ApiError({
    statusCode,
    message,
    details: err,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: false,
  });
}

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const apiError = normalizeError(err);

  const logger = req.app?.locals.logger ?? console;

  const logPayload = {
    message: apiError.message,
    name: apiError.name,
    code: apiError.code,
    statusCode: apiError.statusCode,
    path: req.originalUrl,
    method: req.method,
    details: apiError.details,
    stack: apiError.stack,
  };

  // Log based on operational flag
  if (apiError.isOperational) {
    typeof logger.warn === "function"
      ? logger.warn(logPayload)
      : logger.log?.("warn", logPayload);
  } else {
    typeof logger.error === "function"
      ? logger.error(logPayload)
      : logger.error && logger.error(logPayload);
  }

  // Standardized API response
  const responsePayload = new ApiResponse({
    statusCode: apiError.statusCode,
    message: apiError.message,
    data: null,
    meta: apiError.isOperational ? { code: apiError.code } : null,
  });

  const body = responsePayload.toJSON() as Record<string, unknown>;
  if (process.env.NODE_ENV !== "production") {
    body.stack = apiError.stack;
  }

  res.status(apiError.statusCode).json(body);
};
