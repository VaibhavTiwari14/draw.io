export interface ApiErrorOptions {
  statusCode?: number;
  message?: string;
  code?: string; 
  details?: unknown; 
  isOperational?: boolean; 
}

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(statusOrOptions: number | ApiErrorOptions, message?: string) {
    if (typeof statusOrOptions === "number") {
      super(message ?? "Error");
      this.statusCode = statusOrOptions;
      this.isOperational = true;
    } else {
      super(statusOrOptions.message ?? "Error");
      this.statusCode = statusOrOptions.statusCode ?? 500;
      this.code = statusOrOptions.code;
      this.details = statusOrOptions.details;
      this.isOperational = statusOrOptions.isOperational ?? true;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
    };
  }
}
