import { Router } from "express";
import { BookingStatus, VehicleCategory } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const ridesRouter = Router();

const rideRequestSchema = z.object({
  pickup: z.string().trim().min(2).max(200),
  destination: z.string().trim().min(2).max(200),
  category: z.nativeEnum(VehicleCategory).default(VehicleCategory.ECONOMY),
  distanceKm: z.number().positive().max(1500),
  scheduledAt: z.string().datetime().optional(),
});

function calculateRideFare(distanceKm: number) {
  const baseFare = Number(process.env.RIDE_BASE_FARE_LKR ?? 500);
  const perKmRate = Number(process.env.RIDE_PER_KM_LKR ?? 180);
  return Math.round((baseFare + distanceKm * perKmRate) * 100) / 100;
}

ridesRouter.get("/estimate", (req, res) => {
  const parsed = z.object({ distanceKm: z.coerce.number().positive().max(1500) }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Enter a valid trip distance." });
    return;
  }
  res.json({ currency: "LKR", estimatedFare: calculateRideFare(parsed.data.distanceKm) });
});

ridesRouter.use(requireAuth);

ridesRouter.get("/", async (req, res) => {
  const rides = await prisma.rideBooking.findMany({
    where: { customerId: req.authUser!.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, reference: true, pickup: true, destination: true, status: true, createdAt: true, estimatedFare: true, currency: true },
  });
  res.json({ rides });
});

ridesRouter.post("/", async (req, res) => {
  const parsed = rideRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Check the ride details and try again.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const ride = await prisma.rideBooking.create({
    data: {
      ...parsed.data,
      reference: `WFR-${randomUUID().slice(0, 8).toUpperCase()}`,
      customerId: req.authUser!.id,
      estimatedFare: calculateRideFare(parsed.data.distanceKm),
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      status: BookingStatus.REQUESTED,
    },
  });
  res.status(201).json({ ride });
});