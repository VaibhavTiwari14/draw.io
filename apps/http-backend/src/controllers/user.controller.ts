import { NextFunction, Request, Response } from "express";
import { asyncWrap } from "../utils/asyncHandler";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SignInSchema,
} from "@repo/common/types";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { StatusCodes, ErrorCode } from "@repo/common/enums";
import * as userService from "../services/user.service";
import * as roomService from "../services/room.service";

// ------------------- SIGN IN -------------------
export const SignInUserController = asyncWrap(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = SignInSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid request data",
        details: parsed.error.format(),
        code: ErrorCode.VALIDATION_ERROR,
        isOperational: true,
      });
    }

    try {
      const token = await userService.signInUser(parsed.data);

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Signed in successfully",
        data: { token },
      });

      res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

// ------------------- SIGN UP -------------------
export const SignUpUserController = asyncWrap(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = CreateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid request data",
        details: parsed.error.format(),
        code: ErrorCode.VALIDATION_ERROR,
        isOperational: true,
      });
    }

    try {
      const newUser = await userService.signUpUser(parsed.data);

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.Created,
        message: "User created successfully",
        data: { user: newUser },
      });

      res.status(StatusCodes.Created).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

// ------------------- CREATE ROOM -------------------
export const CreateUserRoomController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = CreateRoomSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid request data",
        details: parsed.error.format(),
        code: ErrorCode.VALIDATION_ERROR,
        isOperational: true,
      });
    }

    try {
      const room = await roomService.createRoom({
        userId: req.userId!,
        ...parsed.data,
      });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.Created,
        message: "Room created successfully",
        data: { room },
      });

      res.status(StatusCodes.Created).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);
