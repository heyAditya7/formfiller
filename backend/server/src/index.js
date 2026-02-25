/**
 * Server Entry - Express + MongoDB
 * server/src/index.js
 *
 * Features: Auto-reconnect DB (har 5 sec retry), color-coded logs, Form API
 */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/formRoutes.js";

dotenv.config();

const app = express();

// CORS - frontend (client) se requests allow
app.use(cors());
app.use(express.json());

// MongoDB URI - .env mein MONGODB_URI ya MONGO_URI set karein
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/formhelper";

const PORT = process.env.PORT || 3000;

/**
 * MongoDB connect with auto-reconnect
 * Agar connection fail ho toh har 5 second baad retry.
 * Mongoose 6+ mein useNewUrlParser/useUnifiedTopology default true hain, alag se dena zaroori nahi.
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("\x1b[32m%s\x1b[0m", "[MongoDB] Connected successfully");
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "[MongoDB] Connection failed:", err.message);
    console.log("\x1b[33m%s\x1b[0m", "[MongoDB] Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("\x1b[33m%s\x1b[0m", "[MongoDB] Disconnected. Will retry on next request.");
});

connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend connected" });
});

app.use("/api/forms", formRoutes);

app.listen(PORT, () => {
  console.log("\x1b[36m%s\x1b[0m", `[Server] Running on http://localhost:${PORT}`);
});
