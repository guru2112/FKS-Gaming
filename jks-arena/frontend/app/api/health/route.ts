import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "ok",
    message: "JKS Arena API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
