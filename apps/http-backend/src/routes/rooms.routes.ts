import { Router } from "express";
import { DeleteRoomController, GetRoomController, JoinRoomController, LeaveRoomController } from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const roomRouter: Router = Router();

roomRouter.route("/:roomId").get(authMiddleware, GetRoomController);
roomRouter.route("/join-room/:roomId").post(authMiddleware, JoinRoomController);
roomRouter.route("/leave-room/:roomId").post(authMiddleware,LeaveRoomController);
roomRouter.route("/delete-room/:roomId").post(authMiddleware,DeleteRoomController);