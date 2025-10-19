import cors from "cors";
import express, { Application } from "express";

const app: Application = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

import { errorMiddleware } from "./lib/globalErrorHandler";
import { roomRouter } from "./routes/rooms.routes";
import userRouter from "./routes/user.routes";
import { chatRouter } from "./routes/chat.routes";

app.use("/api/v1/users", userRouter);
app.use("/api/vi/rooms", roomRouter);
app.use("/api/vi/chats", chatRouter);

app.use(errorMiddleware);

export default app;
