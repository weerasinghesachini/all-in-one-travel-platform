import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RoleName } from "@prisma/client";

type AuthToken = JwtPayload & { sub: string; roles: RoleName[] };

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.wayfarer_token ?? req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const secret = process.env.JWT_SECRET;

  if (!token || !secret || secret.length < 32) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || !decoded.sub || !Array.isArray(decoded.roles)) {
      res.status(401).json({ message: "Invalid session." });
      return;
    }
    req.authUser = { id: decoded.sub, roles: decoded.roles as RoleName[] };
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};

export function requireRole(...allowedRoles: RoleName[]): RequestHandler {
  return (req, res, next) => {
    if (!req.authUser || !req.authUser.roles.some((role) => allowedRoles.includes(role))) {
      res.status(403).json({ message: "You do not have permission to access this resource." });
      return;
    }
    next();
  };
}