import { StatusCodes } from "@repo/common/enums";
import { prisma } from "@repo/DB";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        StatusCodes.Unauthorized,
        "Authentication token missing"
      );
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      throw new ApiError(
        StatusCodes.InternalServerError,
        "JWT secret not configured"
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token!, process.env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      throw new ApiError(StatusCodes.Unauthorized, "Invalid or expired token");
    }

    const userId = decoded.userId as string;
    if (!userId) {
      throw new ApiError(
        StatusCodes.Unauthorized,
        "Token does not contain userId"
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(StatusCodes.Unauthorized, "User not found");
    }

    req.userId = user.id.toString();
    next();
  }
);
