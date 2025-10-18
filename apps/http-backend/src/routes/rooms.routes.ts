import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getRoomController } from "../controllers/room.controller";

export const roomRouter: Router = Router();

roomRouter.route("/:roomId").get(authMiddleware, getRoomController);
