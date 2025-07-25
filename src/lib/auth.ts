import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "./prisma";
import { cookies } from "next/headers";

declare module "next-auth" {
     interface Session {
          user: {
               id: string;
               name?: string | null;
               email?: string | null;
               image?: string | null;
          };
     }
}

export const getSession = async () => {
     const cookieStore = await cookies()
     const sessionToken = cookieStore.get('sessionToken')?.value || cookieStore.get('next-auth.session-token')?.value;
     if (!sessionToken) return null

     const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true }
     })

     if (!session || session.expires < new Date()) {
          return null
     }

     return session
}

export const authOptions: NextAuthOptions = {
     adapter: PrismaAdapter(prisma),
     providers: [
          GoogleProvider({
               clientId: process.env.GOOGLE_CLIENT_ID!,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
          GitHubProvider({
               clientId: process.env.GITHUB_CLIENT_ID!,
               clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
     ],
     session: {
          strategy: 'jwt', // Required for middleware compatibility
     },
     callbacks: {
          async session({ session, token }) {
               if (session.user) {
                    session.user.id = token.sub!;
               }
               return session;
          },
          async jwt({ token }) {
               return token;
          }
     },
     secret: process.env.NEXTAUTH_SECRET,
};