import { JWT_EXPIRES_IN, JWT_SECRET } from "@repo/backend-common/config";
import { ErrorCode, StatusCodes } from "@repo/common/enums";
import { SignInInput, SignUpInput } from "@repo/common/types";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

function validateEnvVariables(
  variables: Record<string, string | undefined>,
  variableNames: string[]
): void {
  for (const name of variableNames) {
    if (!variables[name]) {
      throw new Error(`${name} is not defined in environment`);
    }
  }
}

function generateToken(userId: string): string {
  validateEnvVariables({ JWT_SECRET, JWT_EXPIRES_IN }, [
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
  ]);

  return jwt.sign(
    { userId },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions
  );
}

export async function signInUser({ email, password }: SignInInput) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "User not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ApiError({
        statusCode: StatusCodes.Unauthorized,
        message: "Invalid credentials",
        code: ErrorCode.UNAUTHORIZED,
        isOperational: true,
      });
    }

    const token = generateToken(user.id);

    return token;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to sign in user",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function signUpUser(input: SignUpInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ApiError({
        statusCode: StatusCodes.Conflict,
        message: "User with this email already exists",
        code: ErrorCode.RESOURCE_EXISTS,
        isOperational: true,
      });
    }

    validateEnvVariables({ BCRYPT_SALT: process.env.BCRYPT_SALT }, [
      "BCRYPT_SALT",
    ]);

    const hashedPassword = await bcrypt.hash(
      input.password,
      Number.parseInt(process.env.BCRYPT_SALT as string)
    );

    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        password: hashedPassword,
      },
    });

    return newUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to sign up user",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError({
        statusCode: StatusCodes.NotFound,
        message: "User not found",
        code: ErrorCode.NOT_FOUND,
        isOperational: true,
      });
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError({
      statusCode: StatusCodes.InternalServerError,
      message: "Failed to get user",
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      isOperational: false,
      details: error as Error,
    });
  }
}
