import { ErrorCode } from "@repo/common/enums";
import { prisma } from "@repo/DB";
import { ApiError } from "../utils/ApiError";

export async function createRoom({
  userId,
  roomName,
}: {
  userId: string;
  roomName: string;
}) {

  const slug = roomName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingRoom = await prisma.room.findUnique({
    where: { slug },
  });

  if (existingRoom) {
    throw new ApiError({
      statusCode: 409,
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
      },
    });

    return newRoom;
  } catch (error) {
    throw new ApiError({
      statusCode: 500,
      message: "Failed to create room",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}
