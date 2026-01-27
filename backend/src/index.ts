import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import userRoutes from "./routes/user-routes.js";
import chatRoutes from "./routes/chat-routes.js";

dotenv.config();

const app = express();

/**
 * ✅ REQUIRED for secure cookies behind Render proxy
 */
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatberry.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  console.log("Cookies:", req.cookies);
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

start();
