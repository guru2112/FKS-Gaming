import jwt from "jsonwebtoken";

export function createToken(user: { _id: string; email?: string }, role: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set.");
  }

  // @ts-expect-error -- jsonwebtoken types are strict with expiresIn
  return jwt.sign({ sub: String(user._id), email: user.email || "", role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
