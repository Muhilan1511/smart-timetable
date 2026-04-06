import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { AuthTokenPayload, Role } from "../types.js";

type RequestWithUser = Request & { user?: AuthTokenPayload };

export const requireAuth = (roles?: Role[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing bearer token" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
      req.user = payload;

      if (roles && roles.length > 0 && !roles.includes(payload.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};
