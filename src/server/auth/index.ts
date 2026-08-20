import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { loginSchema } from "@/lib/validations/auth";
import "./types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-at-least-32-characters-long-feast-hub",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        if (user.isBanned) {
          throw new Error("ACCOUNT_BANNED: Your account has been suspended by an administrator.");
        }

        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          image: user.image,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.isBanned = user.isBanned;
      }

      // Handle session updates (e.g. name change)
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.phone = session.user.phone ?? token.phone;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.phone = token.phone as string | null;
        session.user.isBanned = token.isBanned as boolean;
      }
      return session;
    },
  },
});
