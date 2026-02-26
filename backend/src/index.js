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
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import formRoutes from "./routes/formRoutes.js";

dotenv.config();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS - Restrict in production, allow local in dev
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// 3. Rate Limiting - Prevents Brute Force / DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// 4. Body Parsing with Size Limits (Prevents large payload attacks)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. Data Sanitization against NoSQL query injection (Express 5 Compatible)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("$")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    });
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// API Key Authentication Middleware
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validKey = process.env.API_KEY || "form_helper_secret_key_2026";

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
  }
  next();
};

// Protect all /api routes except health check
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  authenticateAPI(req, res, next);
});

// Ensure API responses are always JSON
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// MongoDB URI - .env mein MONGODB_URI ya MONGO_URI set karein
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/formhelper";

console.log("[Config] MONGODB_URI loaded:", MONGODB_URI.includes("@") ? MONGODB_URI.split("@")[1] : MONGODB_URI);

const PORT = process.env.PORT || 5000;

// Mongoose Configuration
mongoose.set("bufferCommands", false); // Disable buffering to catch connection issues early

/**
 * MongoDB connect with auto-reconnect
 */
async function connectDB() {
  console.log("[MongoDB] Attempting to connect...");
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("\x1b[32m%s\x1b[0m", "[MongoDB] Connected successfully");
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "[MongoDB] Connection failed:", err.message);
    if (err.message.includes("whitelist")) {
      console.error("[MongoDB] Hint: Check if your IP is whitelisted in MongoDB Atlas.");
    }
    console.log("\x1b[33m%s\x1b[0m", "[MongoDB] Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("\x1b[33m%s\x1b[0m", "[MongoDB] Disconnected.");
});

connectDB();

// Routes
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected/Connecting";
  res.send(`Backend Running (Database: ${dbStatus})`);
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend connected",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/forms", formRoutes);

app.listen(PORT, () => {
  console.log("\x1b[36m%s\x1b[0m", `[Server] Running on http://localhost:${PORT}`);
});
