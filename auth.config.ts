import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export default {
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { username: credentials.username as string },
                });

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (passwordsMatch) return user as any;

                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
