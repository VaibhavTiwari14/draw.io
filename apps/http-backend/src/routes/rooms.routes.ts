import { Router } from "express";
import { GetRoomController } from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const roomRouter: Router = Router();

roomRouter.route("/:roomId").get(authMiddleware, GetRoomController);
