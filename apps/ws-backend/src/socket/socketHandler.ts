import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { checkUser } from "../middlewares/auth.middleware";
import { routeMessage } from "./messageRouter";
import { SocketMessage } from "@repo/common/enums";


export function socketHandler(
  ws: WebSocket & { isAlive?: boolean; userId?: string },
  req: IncomingMessage,
  wss: WebSocketServer
) {
  const userId = checkUser(req);
  if (!userId) {
    ws.close(4001, "Unauthorized");
    return;
  }

  ws.userId = userId;
  ws.isAlive = true;
  console.log(`✅ User connected: ${userId}`);

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw) => {
    try {
      const data: SocketMessage = JSON.parse(raw.toString());
      routeMessage(data, ws, wss);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    }
  });

  ws.on("close", () => console.log(`❌ Disconnected: ${userId}`));
}
