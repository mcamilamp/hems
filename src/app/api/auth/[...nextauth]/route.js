import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Credenciales inválidas");
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // El JWT es una foto del login: sin esto, el saludo del dashboard y el
      // sidebar se quedan con el nombre viejo hasta cerrar sesion, y tampoco se
      // enteran si un admin edita al usuario. Releemos la fuente de verdad en
      // cada validacion de sesion. Cuesta una query; a cambio la app nunca
      // muestra datos rancios ni depende de que alguien llame a update().
      if (token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: { name: true, email: true, image: true, role: true },
        });

        if (fresh) {
          token.name = fresh.name;
          token.email = fresh.email;
          token.picture = fresh.image;
          token.role = fresh.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // next-auth arma session.user.name/email a partir del token *antes* de
        // pasarlo por el callback jwt (core/routes/session.js), asi que al
        // refrescar la sesion devolvia los datos viejos. El token que llega
        // aca ya es el nuevo: mandan estos.
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

