import { ErrorCode, StatusCodes } from "@repo/common/enums";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as roomService from "../services/room.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncWrap } from "../utils/asyncHandler";

export const GetRoomController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params;

    if (!roomId) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid roomId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const room = await roomService.getRoom({ roomId });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Room data fetched successfully",
        data: { room },
      });

      return res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

export const JoinRoomController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { roomId } = req.params;

    if (!roomId) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid roomId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const room = await roomService.joinRoom({ userId, roomId });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Joined room successfully",
        data: { room },
      });

      return res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

export const LeaveRoomController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { roomId } = req.params;

    if (!roomId) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid roomId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      await roomService.leaveRoom({ userId, roomId });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Left room successfully",
        data: { roomId },
      });

      return res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

export const DeleteRoomController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const { roomId } = req.params;

    if (!roomId) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid roomId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const deleteResponse = await roomService.deleteRoom({
        userId,
        roomId,
      });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Room deleted successfully",
        data: {
          roomId: deleteResponse.roomId,
        },
      });

      return res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);
