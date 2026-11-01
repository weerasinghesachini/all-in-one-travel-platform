import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  const destinations = [
    { name: "Ella", slug: "ella", description: "Tea country, waterfalls and mountain trails.", latitude: -6.8667, longitude: 81.0466 },
    { name: "Galle Fort", slug: "galle-fort", description: "A historic coastal town with a walkable fort district.", latitude: 6.026, longitude: 80.217 },
    { name: "Sigiriya", slug: "sigiriya", description: "Ancient rock fortress and cultural landscape.", latitude: 7.957, longitude: 80.7603 },
  ];
  for (const destination of destinations) {
    await prisma.destination.upsert({ where: { slug: destination.slug }, update: destination, create: destination });
  }
}

main().finally(() => prisma.$disconnect());