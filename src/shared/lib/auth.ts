import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';

import { db } from './db';
import { verifyPassword } from './password';

// Zod schema for login validation
const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'tu@email.com',
        },
        password: {
          label: 'Contraseña',
          type: 'password',
        },
      },
      async authorize(credentials) {
        try {
          // Validate input with Zod
          const parsedCredentials = signInSchema.safeParse(credentials);

          if (!parsedCredentials.success) {
            console.error('Validation error:', parsedCredentials.error);
            return null;
          }

          const { email, password } = parsedCredentials.data;

          // Fetch user from database
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error('User not found:', email);
            return null;
          }

          // Verify password with bcrypt
          const isValid = await verifyPassword(user.password, password);

          if (!isValid) {
            console.error('Invalid password for user:', email);
            return null;
          }

          // Return user object (will be available in JWT callback)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            preferredName: user.preferredName,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Required for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, user object is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.preferredName = user.preferredName;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach user data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.preferredName = token.preferredName as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

// Export types for TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      preferredName: string;
      role: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    preferredName: string;
    role: string;
    image?: string | null;
  }
}
