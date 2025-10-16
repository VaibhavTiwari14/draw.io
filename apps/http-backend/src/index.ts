import app from "./app";
import { connectDB } from "@repo/db";
import dotenv from 'dotenv';

dotenv.config({
    path : "./.env"
});

const PORT = process.env.PORT || 3002;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`HTTP Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
