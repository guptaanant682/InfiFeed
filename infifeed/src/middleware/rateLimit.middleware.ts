import rateLimit from "express-rate-limit";

// Basic rate limiter configuration
// Allow 100 requests per 15 minutes from the same IP
export const basicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes.",
  // handler: (req, res, next, options) => { // Custom handler
  //   res.status(options.statusCode).json({ message: options.message });
  // }
});

// Stricter rate limiter for sensitive actions like login/signup
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
});

console.log("Rate limiting middleware configured.");
