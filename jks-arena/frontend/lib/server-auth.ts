import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type AuthResult = { userId: string; userRole: string };

export async function authenticate(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { message: "Missing auth token." },
      { status: 401 }
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "JWT_SECRET is not set." },
      { status: 500 }
    );
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    return {
      userId: payload.sub as string,
      userRole: (payload.role as string) || "user",
    };
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token." },
      { status: 401 }
    );
  }
}

export async function requireAdmin(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  if (auth.userRole !== "admin") {
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 }
    );
  }

  return auth;
}
