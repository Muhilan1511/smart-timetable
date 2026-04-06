import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { Role } from "../types.js";

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface SeedUser {
  id: string;
  email: string;
  password: string;
  role: Role;
}

const users: SeedUser[] = [
  {
    id: "1",
    email: "admin@college.local",
    password: "admin123",
    role: "ADMIN"
  },
  {
    id: "2",
    email: "coordinator@college.local",
    password: "coord123",
    role: "COORDINATOR"
  }
];

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body as LoginRequestBody;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = users.find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: "8h" }
  );

  res.json({
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});
