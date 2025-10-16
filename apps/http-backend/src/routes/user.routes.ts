import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { SignInUserController, SignUpUserController, CreateUserRoomController } from "../controllers/user.controller";

const userRouter : Router = Router();

userRouter.route("/signup").post(SignUpUserController);
userRouter.route("/signin").post(SignInUserController);
userRouter.route("/room").post(authMiddleware,CreateUserRoomController);

export default userRouter;