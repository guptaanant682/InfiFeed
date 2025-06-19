import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";
import { basicRateLimiter, authRateLimiter } from "./middleware/rateLimit.middleware";
import { globalErrorHandler } from "./middleware/errorHandler.middleware";

dotenv.config();

const app: Application = express();

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all if ALLOWED_ORIGINS is empty or contains '*'
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Important for cookies, authorization headers
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(express.json());

// Apply basic rate limiting to all requests after essential parsing
app.use(basicRateLimiter);

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Global error handler - should be the last middleware
app.use(globalErrorHandler);

export default app;
