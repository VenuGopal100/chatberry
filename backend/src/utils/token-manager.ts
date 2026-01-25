import jwt from "jsonwebtoken";

export function createToken(userId: string, email: string) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId, email }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as { userId: string; email: string; iat: number; exp: number };
}
