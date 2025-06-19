import { Request, Response, NextFunction } from "express";

// Define a common structure for error responses
interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: any; // Additional error details for development
}

// Custom error class (optional, but good for structured errors)
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean; // True for expected errors (e.g., validation)

  constructor(statusCode: number, message: string, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Differentiate programmer errors from operational errors
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Determine status code
  const statusCode = (err instanceof ApiError && err.isOperational) ? err.statusCode : 500;

  // Log the error (can be expanded with a more sophisticated logger)
  console.error("ERROR \nPath:", req.path, "\nMethod:", req.method);
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  if (err.stack) {
    console.error("Error Stack:", err.stack.substring(0, 500)); // Log part of stack
  }
  // For pg errors, some details might be useful
  if (err.hasOwnProperty("code") && err.hasOwnProperty("detail")) {
    // @ts-ignore
    console.error("DB Error Code:", err.code);
    // @ts-ignore
    console.error("DB Error Detail:", err.detail);
  }


  const response: ErrorResponse = {
    message: (err instanceof ApiError && err.isOperational) ? err.message : "An unexpected error occurred on the server.",
    statusCode: statusCode,
  };

  // Include stack trace in development mode only for debugging
  if (process.env.NODE_ENV === "development" && !(err instanceof ApiError && err.isOperational)) {
    response.error = { name: err.name, message: err.message, stack: err.stack };
  }

  // Send the response
  // Ensure headers are not already sent
  if (!res.headersSent) {
    res.status(statusCode).json(response);
  } else {
    // If headers already sent, delegate to default Express error handler
    // This usually means an error occurred while streaming response, so Express default handler is better.
    // However, this middleware should be the last one, so this case is less likely for typical API errors.
    // next(err); // This would call the default Express error handler
    console.error("Headers already sent, could not send error response to client.");
  }
};

console.log("Global error handling middleware configured.");
