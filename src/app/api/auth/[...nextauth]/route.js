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
              const user = {
                id: dbUser._id.toString(),
                firstname: dbUser.name?.firstname,
                lastname: dbUser.name?.lastname,
                username: dbUser.username,
                email: dbUser.email,
                role: dbUser.role,
              };

              if (dbUser.name?.middlename) {
                user.middlename = dbUser.name.middlename;
              }

              return user;
            } else {
              console.error("User not found in the database.");
              return null;
            }
          } else {
            console.error(
              "Authentication response is invalid or missing email."
            );
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
          prompt: "select_account", // Force the user to select an account
        },
      },
    }),
  ],
  pages: {
    signIn: "/", // Custom sign-in page
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      // Check if the user is signing in with Google and if their email is in the database
      if (account.provider === "google" && user.email) {
        try {
          const dbUser = await getUserbyEmail(user.email);
          if (dbUser) {
            user.id = dbUser._id.toString();
            user.firstname = dbUser.name?.firstname;
            user.middlename = dbUser.name?.middlename || null;
            user.lastname = dbUser.name?.lastname;
            user.username = dbUser.username;
            user.email = dbUser.email;
            user.role = dbUser.role;
            return true;
          } else {
            return false; // Deny sign-in if email not found in the database
          }
        } catch (error) {
          console.error("Error checking user in database:", error);
          return false;
        }
      }
      return true; // Allow sign-in for other providers or cases
    },

    async jwt({ token, user }) {
      // Add user info to the token on sign-in
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.middlename = user.middlename;
        token.lastname = user.lastname;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role; // Default role if not provided
      }
      return token;
    },

    async session({ session, token }) {
      // Add token info to the session object
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.middlename = token.middlename;
        session.user.lastname = token.lastname;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
