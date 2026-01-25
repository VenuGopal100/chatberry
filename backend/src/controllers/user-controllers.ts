import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user-model.js";
import { createToken } from "../utils/token-manager.js";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/"
  };
}

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be 6+ chars" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, conversations: [] });

    const token = createToken(user._id.toString(), user.email);
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(500).json({ message: "Signup failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(user._id.toString(), user.email);
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ message: "Logged out" });
  } catch {
    return res.status(500).json({ message: "Logout failed" });
  }
}

export async function authStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const user = await User.findById(userId).select("name email");
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    return res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(500).json({ message: "Auth status failed" });
  }
}
