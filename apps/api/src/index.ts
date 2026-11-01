import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { ridesRouter } from "./routes/rides";
import { prisma } from "./lib/prisma";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.disable("x-powered-by");
app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "wayfarer-api" }));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rides", ridesRouter);

app.use((_req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "An unexpected error occurred." });
});

const server = app.listen(port, () => console.log(`Wayfarer API listening on http://localhost:${port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());