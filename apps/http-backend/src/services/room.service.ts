import { ErrorCode, StatusCodes } from "@repo/common/enums";
import { prisma } from "@repo/DB";
import { ApiError } from "../utils/ApiError";

const generateSlug = (roomName: string) =>
  roomName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function createRoom({
  userId,
  roomName,
}: {
  userId: string;
  roomName: string;
}) {
  const slug = generateSlug(roomName);

  const existingRoom = await prisma.room.findUnique({
    where: { slug },
  });

  if (existingRoom) {
    throw new ApiError({
      statusCode: StatusCodes.Conflict,
      message: "Room with this name already exists",
      code: ErrorCode.RESOURCE_EXISTS,
      isOperational: true,
    });
  }

  try {
    const newRoom = await prisma.room.create({
      data: {
        slug,
        adminId: userId,
        members: {
          connect: { id: userId },
        },
      },
    });

    return newRoom;
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to create room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function getRoom({
  roomId,
  skip = 0,
  take = 30,
}: {
  roomId: string;
  skip?: number;
  take?: number;
}) {
  try {
    const room = await prisma.room.findFirst({
      where: { id: roomId },
      include: {
        members: {
          select: { id: true, username: true, photo: true },
        },
        chats: {
          orderBy: { createdAt: "desc" },
          skip,
          take,
          include: {
            user: {
              select: { id: true, username: true, photo: true },
            },
          },
        },
      },
    });

    if (!room) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Room not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    return room;
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to fetch room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function joinRoom({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { select: { id: true } },
      },
    });

    if (!room) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Room not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    const alreadyJoined = room.members.some((m) => m.id === userId);

    if (!alreadyJoined) {
      await prisma.room.update({
        where: { id: roomId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });
    }

    return await getRoom({ roomId });
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to join room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function leaveRoom({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        adminId: true,
        members: { select: { id: true } },
      },
    });

    if (!room) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Room not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    if (room.adminId === userId) {
      throw new ApiError({
        statusCode: StatusCodes.Forbidden,
        message: "Admin cannot leave without deleting the room",
        code: ErrorCode.FORBIDDEN,
        isOperational: true,
      });
    }

    const exists = room.members.some((m) => m.id === userId);

    if (exists) {
      await prisma.room.update({
        where: { id: roomId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });
    }
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to leave room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function deleteRoom({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { adminId: true },
    });

    if (!room) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "Room not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    if (room.adminId !== userId) {
      throw new ApiError({
        statusCode: StatusCodes.Forbidden,
        message: "Only admin can delete this room",
        code: ErrorCode.UNAUTHORIZED,
        isOperational: true,
      });
    }

    await prisma.chat.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });

    return { success: true, message: "Room deleted successfully", roomId };
  } catch (error) {
    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to delete room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}
