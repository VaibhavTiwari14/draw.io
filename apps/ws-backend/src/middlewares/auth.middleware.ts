import { JWT_SECRET } from "@repo/backend-common/config";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
}

export function checkUser(request: IncomingMessage): string | null {
  if (!request.url) return null;

  const queryParams = new URLSearchParams(request.url.split("?")[1] || "");
  const authHeader = request.headers?.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : "";

  const token = queryParams.get("token") || headerToken || "";
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    if (typeof decoded !== "object" || !decoded.userId) return null;
    return decoded.userId;
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return null;
  }
}
