import { Router } from "express";
import {
  DeleteChatController,
  GetRoomsChatController,
  SaveChatController,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const chatRouter: Router = Router();

chatRouter.route("/room/:roomId").get(authMiddleware, GetRoomsChatController);
chatRouter.route("/save").post(authMiddleware, SaveChatController);
chatRouter.route("/delete/:chatId").post(authMiddleware,DeleteChatController);
