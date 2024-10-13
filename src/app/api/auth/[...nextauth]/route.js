import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import getUserbyEmail from "@/lib/userService";
import dbConnect from "@/lib/mongodb";
import roles from "@/lib/models/roles";
import user from "@/lib/models/user";
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
          const account = await user.findOne({
            username: credentials.username,
          });

          if (
            account &&
            bcrypt.compareSync(credentials.password, account.password)
          ) {
            const roleData = await roles.findOne({ name: account.role });
            return {
              id: account._id.toString(),
              firstname: account.firstname,
              role: account.role,
              roleData: roleData.permissions,
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
            const roleData = await roles.findOne({ name: account.role });
            user.id = dbUser._id.toString();
            user.firstname = dbUser.firstname;
            user.role = dbUser.role;
            user.roleData = roleData.permissions;

            return true;
          } else {
            console.error("User not found in the database.");
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
        token.role = user.role;
        if (user.roleData) {
          token.roleData = user.roleData; // Add office/user details
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.role = token.role;
        session.user.roleData = token.roleData || null; // Include role-specific data
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
