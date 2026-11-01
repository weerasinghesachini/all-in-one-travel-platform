import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma, RoleName } from "@prisma/client";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: sessionDurationMs,
};

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2).max(100),
});

function safeUser(user: { id: string; fullName: string; email: string; roles: { role: { name: RoleName } }[] }) {
  return { id: user.id, fullName: user.fullName, email: user.email, roles: user.roles.map(({ role }) => role.name) };
}

function setSession(res: Response, user: ReturnType<typeof safeUser>) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  const token = jwt.sign({ roles: user.roles }, secret, { subject: user.id, expiresIn: "7d" });
  res.cookie("wayfarer_token", token, cookieOptions);
}

authRouter.post("/register", authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Check the details and try again.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    res.status(500).json({ message: "Authentication is not configured." });
    return;
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const customerRole = await tx.role.upsert({ where: { name: RoleName.CUSTOMER }, update: {}, create: { name: RoleName.CUSTOMER } });
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      return tx.user.create({
        data: {
          email: parsed.data.email,
          fullName: parsed.data.fullName,
          passwordHash,
          customerProfile: { create: {} },
          roles: { create: { roleId: customerRole.id } },
        },
        include: { roles: { include: { role: true } } },
      });
    });
    const publicUser = safeUser(user);
    setSession(res, publicUser);
    res.status(201).json({ user: publicUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }
    throw error;
  }
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid email and password." });
    return;
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    res.status(500).json({ message: "Authentication is not configured." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { roles: { include: { role: true } } },
  });
  const validPassword = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !user.isActive || !validPassword) {
    res.status(401).json({ message: "Email or password is incorrect." });
    return;
  }

  const publicUser = safeUser(user);
  setSession(res, publicUser);
  res.json({ user: publicUser });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("wayfarer_token", { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.authUser!.id },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) {
    res.status(401).json({ message: "Session is no longer valid." });
    return;
  }
  res.json({ user: safeUser(user) });
});