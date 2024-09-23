import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import getUserbyEmail from "@/lib/userService";
import dbConnect from "@/lib/mongodb";
import accounts from "@/lib/models/accounts";
import bcrypt from "bcryptjs";

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
          await dbConnect();
          const user = await accounts.findOne({
            username: credentials.username,
          });

          if (user && bcrypt.compareSync(credentials.password, user.password)) {
            console.log(user)
            // Return user if valid
            return {
              id: user._id.toString(),
              firstname: user.firstname,
              lastname: user.lastname,
              username: user.username,
              email: user.email,
              role: user.role,
              middlename: user.middlename || null,
            };
          } else {
            console.error("Invalid username or password");
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
    maxAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google" && user.email) {
        try {
          const dbUser = await getUserbyEmail(user.email);
          if (dbUser) {
            user.id = dbUser._id.toString();
            user.firstname = dbUser.firstname;
            user.middlename = dbUser.middlename || null;
            user.lastname = dbUser.lastname;
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
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.middlename = user.middlename;
        token.lastname = user.lastname;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
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
