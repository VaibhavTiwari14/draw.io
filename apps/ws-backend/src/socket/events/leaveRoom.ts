import { WebSocket, WebSocketServer } from "ws";
import { SocketMessage, WSEvent } from "@repo/common/enums";

export function handleLeaveRoom(
  data: SocketMessage,
  ws: WebSocket & { userId?: string },
  wss: WebSocketServer
) {
  const payload = {
    type: "event",
    event: WSEvent.LEAVE_ROOM,
    from: ws.userId,
    message: data.message,
    roomId: data.roomId,
  };

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
