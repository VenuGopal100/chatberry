import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import userRoutes from "./routes/user-routes.js";
import chatRoutes from "./routes/chat-routes.js";

dotenv.config();
console.log("GROQ_BASE_URL:", process.env.GROQ_BASE_URL);
console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// ✅ no signing needed, but secret doesn't hurt
app.use(cookieParser(process.env.COOKIE_SECRET));

/** ✅ DEBUG: log incoming cookies for every request */
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
    const mongoUrl = process.env.MONGO_URL!;
    await mongoose.connect(mongoUrl);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

start();
