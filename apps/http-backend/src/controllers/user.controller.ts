import { ErrorCode, StatusCodes } from "@repo/common/enums";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SignInSchema,
} from "@repo/common/types";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as roomService from "../services/room.service";
import * as userService from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncWrap } from "../utils/asyncHandler";

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

// ------------------- GET USER -------------------
export const GetUserConroller = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId || !userId.trim()) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid UserId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const user = await userService.getUser(userId);

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.Created,
        message: "User created successfully",
        data: { user },
      });

      res.status(StatusCodes.Created).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);
