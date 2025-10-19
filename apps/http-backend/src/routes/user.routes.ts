import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { SignInUserController, SignUpUserController, CreateUserRoomController, GetUserConroller } from "../controllers/user.controller";

const userRouter : Router = Router();

userRouter.route("/signup").post(SignUpUserController);
userRouter.route("/signin").post(SignInUserController);
userRouter.route("/create-room").post(authMiddleware,CreateUserRoomController);
userRouter.route("/get-user/:userId").get(authMiddleware, GetUserConroller);

export default userRouter;