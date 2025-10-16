export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  VALIDATION_ERROR = "VALIDATION_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  MISSING_FIELDS = "MISSING_FIELDS",
  INVALID_INPUT = "INVALID_INPUT",

  NOT_FOUND = "NOT_FOUND",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  CONFLICT = "CONFLICT",

  DB_CONNECTION_FAILED = "DB_CONNECTION_FAILED",
  DB_QUERY_FAILED = "DB_QUERY_FAILED",

  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export enum StatusCodes {
  Continue = 100,
  SwitchingProtocols = 101,

  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,

  MovedPermanently = 301,
  Found = 302,

  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
}
