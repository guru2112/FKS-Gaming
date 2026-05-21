import { NextResponse } from "next/server";

export function handleApiError(err: unknown): NextResponse {
  const error = err as Error & {
    statusCode?: number;
    status?: number;
    code?: number;
    errors?: Record<string, { message: string }>;
    name?: string;
  };

  console.error("API Error:", error.message || error);

  // JWT errors
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token. Please log in again.",
        code: "TOKEN_INVALID",
      },
      { status: 401 }
    );
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {})
      .map((e) => e.message)
      .join(", ");
    return NextResponse.json(
      {
        success: false,
        message: messages || "Validation error",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    return NextResponse.json(
      {
        success: false,
        message: "A record with that value already exists.",
        code: "DUPLICATE_KEY",
      },
      { status: 409 }
    );
  }

  // Generic error
  const status = error.statusCode || error.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error. Please try again later."
      : error.message || "Server error";

  return NextResponse.json({ success: false, message }, { status });
}
