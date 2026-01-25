import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token-manager.js";

export interface AuthedRequest extends Request {
  userId?: string;
  email?: string;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    // JWT stored in normal cookie named "token"
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
