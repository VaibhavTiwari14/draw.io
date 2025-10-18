import { WebSocketServer } from "ws";
import { socketHandler } from "./socket/socketHandler";

export function startSocketServer() {
  const port = Number.parseInt(process.env.WSS_PORT!) || 3001;
  const wss = new WebSocketServer({ port });

  console.log(`✅ WSS running on ws://localhost:${port}`);

  wss.on("connection", (ws, req) => {
    socketHandler(ws, req, wss);
  });

  setInterval(() => {
    wss.clients.forEach((client: any) => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);
}
