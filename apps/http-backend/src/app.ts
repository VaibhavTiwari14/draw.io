import express, { Application } from "express";
import cors from 'cors';

const app : Application = express();

app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true, limit : "16kb"}));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


import userRouter from "./routes/user.routes";
import { errorMiddleware } from "./lib/globalErrorHandler";

app.use('/api/v1/users', userRouter);





app.use(errorMiddleware);

export default app;
