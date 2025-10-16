import { StatusCodes } from '../lib/types'

export type MetaObject = Record<string, unknown> | null;

export class ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  meta?: MetaObject | null;

  constructor({
    statusCode = StatusCodes.OK,
    message = "Success",
    data = null,
    meta = null,
  }: {
    statusCode?: number;
    message?: string;
    data?: T | null;
    meta?: MetaObject | null;
  }) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data ?? null;
    this.meta = meta ?? null;
  }

  send(res: import("express").Response) {
    res.status(this.statusCode).json(this.toJSON());
  }

  toJSON() {
    const base: Record<string, unknown> = {
      success: this.success,
      message: this.message,
      statusCode: this.statusCode,
    };

    if (this.data !== null) base.data = this.data;
    if (this.meta) base.meta = this.meta;
    return base;
  }
}
