import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // Ensures .env variables are loaded

const redisUrl = process.env.REDIS_URL;
let redisClient: IORedis | null = null;

if (redisUrl) {
  redisClient = new IORedis(redisUrl);

  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
    // Potentially disable caching features if Redis is down, or retry connection
    // For now, we just log the error. App should ideally function without Redis, albeit slower.
  });
} else {
  console.warn("REDIS_URL not defined. Redis caching will be disabled.");
}

export default redisClient;
