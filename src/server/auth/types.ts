import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";
import { type JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      phone?: string | null;
      isBanned?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    phone?: string | null;
    isBanned?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    phone?: string | null;
    isBanned?: boolean;
  }
}
