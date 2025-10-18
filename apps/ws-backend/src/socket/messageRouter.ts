import { WebSocket, WebSocketServer } from "ws";
import { SocketMessage } from "@repo/common/enums";
import { handleSendMessage } from "./events/sendMessage";
import { handleJoinRoom } from "./events/joinRoom";
import { handleLeaveRoom } from "./events/leaveRoom";

export function routeMessage(
  message: SocketMessage,
  ws: WebSocket & { userId?: string },
  wss: WebSocketServer
) {
  if (message.type !== "event") {
    ws.send(JSON.stringify({ type: "error", message: "Invalid message type" }));
    return;
  }

  switch (message.event) {
    case "send_message":
      return handleSendMessage(message, ws, wss);
    case "join_room":
      return handleJoinRoom(message, ws, wss);
    case "leave_room":
      return handleLeaveRoom(message, ws, wss);
    default:
      ws.send(JSON.stringify({ type: "error", message: "Unknown event" }));
  }
}
