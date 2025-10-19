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
    if (!roomId || !roomId.trim()) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid RoomId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const room = await roomService.getRoom({ roomId });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.Found,
        message: "Room data fetched successfully",
        data: { room },
      });

      res.status(StatusCodes.Found).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);
