import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import getUserbyEmail from "@/lib/userService";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/authenticate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            }
          );

          const data = await res.json();

          if (res.ok && data.email) {
            const dbUser = await getUserbyEmail(data.email);

            if (dbUser) {
              return {
                id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role,
              };
            } else {
              return null;
            }
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error authorizing user:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      async profile(profile) {

        return {
          id: profile.sub, // Use Google user ID if no database user
          name: profile.name,
          email: profile.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    jwt: true,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = user.role || "office"; // Default role
      }
      return token;
    },

    async session({ session, token }) {
      session.user.email = token.email;
      session.user.role = token.role || "office"; // Default role
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
