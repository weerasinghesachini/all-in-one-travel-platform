import type { RoleName } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; roles: RoleName[] };
    }
  }
}

export {};