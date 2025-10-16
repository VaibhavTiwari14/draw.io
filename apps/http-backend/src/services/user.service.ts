import { JWT_EXPIRES_IN, JWT_SECRET } from "@repo/backend-common/config";
import { ErrorCode } from "@repo/common/enums";
import { SignInInput, SignUpInput } from "@repo/common/types";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

export async function signInUser({ email, password }: SignInInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      message: "User not found",
      code: ErrorCode.NOT_FOUND,
      isOperational: true,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid credentials",
      code: ErrorCode.UNAUTHORIZED,
      isOperational: true,
    });
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }

  if (!JWT_EXPIRES_IN) {
    throw new Error("JWT_EXPIRES_IN is not defined in environment");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);

  return token;
}

export async function signUpUser(input: SignUpInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new ApiError({
      statusCode: 409,
      message: "User with this email already exists",
      code: ErrorCode.RESOURCE_EXISTS,
      isOperational: true,
    });
  }

  const bcryptSalt = process.env.BCRYPT_SALT;

  if (!bcryptSalt) {
    throw new Error("BCRYPT_SALT is not defined in environment");
  }

  const hashedPassword = await bcrypt.hash(input.password, Number.parseInt(bcryptSalt));

  const newUser = await prisma.user.create({
    data: {
      email: input.email,
      name: input.username,
      password: hashedPassword,
    },
  });
  
  return newUser;
}
