import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { compare } from "bcryptjs";
import { getMongoClientPromise, isMongoConfigured } from "@/lib/mongodb";
import { ensureUserIndexes, findUserByEmail, findUserById, syncOAuthUser } from "@/lib/users";
import { USER_ROLE } from "@/lib/roles";

const providers = [];
const googleClientId = (
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  ""
).trim();
const googleClientSecret = (
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  ""
).trim();
export const isGoogleConfigured = Boolean(googleClientId && googleClientSecret);

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-auth-secret-change-me" : undefined);
const mongoConfigured = isMongoConfigured();
const mongoClientPromise = getMongoClientPromise();

if (isGoogleConfigured) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email;
      const password = credentials?.password;

      if (!email || !password || !isMongoConfigured()) return null;

      await ensureUserIndexes();
      const user = await findUserByEmail(email);

      if (!user?.passwordHash) return null;

      const passwordMatches = await compare(String(password), user.passwordHash);

      if (!passwordMatches) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role || USER_ROLE,
      };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  adapter: mongoConfigured && mongoClientPromise
    ? MongoDBAdapter(
        mongoClientPromise,
        process.env.MONGODB_DB_NAME
          ? { databaseName: process.env.MONGODB_DB_NAME }
          : undefined
      )
    : undefined,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (isMongoConfigured() && account?.provider === "google" && user?.id && user.email) {
        await syncOAuthUser({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
        });

        const syncedUser = await findUserById(user.id);
        if (syncedUser) {
          user.role = syncedUser.role || USER_ROLE;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id || token.sub;
        token.provider = account?.provider || token.provider || "credentials";
        token.role = user.role || token.role || USER_ROLE;
      }

      if (token.userId && isMongoConfigured()) {
        const databaseUser = await findUserById(token.userId);
        token.role = databaseUser?.role || token.role || USER_ROLE;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId || token.sub;
        session.user.provider = token.provider || null;
        session.user.role = token.role || USER_ROLE;
      }

      return session;
    },
  },
});
