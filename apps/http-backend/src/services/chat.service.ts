import { ErrorCode, StatusCodes } from "@repo/common/enums";
import { SaveChatWithUserInput } from "@repo/common/types";
import { prisma } from "@repo/DB";
import { ApiError } from "../utils/ApiError";

export async function getChats(roomId: string) {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });

    if (!chats || chats.length === 0) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "No chats found in this room",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    return chats;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: 500,
      message: "Failed to fetch room's chats",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function saveChats({
  message,
  roomId,
  userId,
}: SaveChatWithUserInput) {
  try {
    const roomExists = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!roomExists) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Room not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    const response = await prisma.chat.create({
      data: {
        message,
        roomId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return response;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: 500,
      message: "Failed to save chat",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function deleteChat(chatId: number, userId: string) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Chat not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    if (chat.userId !== userId) {
      throw new ApiError({
        statusCode: StatusCodes.Forbidden,
        message: "You can only delete your own messages",
        code: ErrorCode.FORBIDDEN,
        isOperational: true,
      });
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return {
      id: chatId,
      status: "permanently_deleted",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: 500,
      message: "Failed to delete chat",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}
