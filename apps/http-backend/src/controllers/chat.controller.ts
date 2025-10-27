import { ErrorCode, StatusCodes } from "@repo/common/enums";
import { SaveChatSchema } from "@repo/common/types";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as chatService from "../services/chat.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncWrap } from "../utils/asyncHandler";

export const GetRoomsChatController = asyncWrap(
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
      const chats = await chatService.getChats(roomId);

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Chats fetched successfully",
        data: { chats },
      });

      res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

export const SaveChatController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsedResponse = SaveChatSchema.safeParse(req.body);

    if (!parsedResponse.success) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid request data",
        details: parsedResponse.error.format(),
        code: ErrorCode.VALIDATION_ERROR,
        isOperational: true,
      });
    }

    try {
      const userId = req.userId!;
      const response = await chatService.saveChats({
        ...parsedResponse.data,
        userId,
      });

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Chat saved Successfully",
        data: { response },
      });

      res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

export const DeleteChatController = asyncWrap(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const chatId = Number(req.params.chatId);
    const userId = req.userId!;

    if (!chatId || Number.isNaN(chatId)) {
      throw new ApiError({
        statusCode: StatusCodes.BadRequest,
        message: "Invalid chatId",
        code: ErrorCode.INVALID_INPUT,
        isOperational: true,
      });
    }

    try {
      const result = await chatService.deleteChat(chatId, userId);

      const responsePayload = new ApiResponse({
        statusCode: StatusCodes.OK,
        message: "Message permanently deleted",
        data: { result },
      });

      return res.status(StatusCodes.OK).json(responsePayload.toJSON());
    } catch (error) {
      next(error);
    }
  }
);
