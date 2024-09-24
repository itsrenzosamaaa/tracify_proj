import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import getUserbyEmail from "@/lib/userService";
import dbConnect from "@/lib/mongodb";
import accounts from "@/lib/models/accounts";
import Office from "@/lib/models/office";
import User from "@/lib/models/user";
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
          const account = await accounts.findOne({ username: credentials.username });
      
          if (account && bcrypt.compareSync(credentials.password, account.password)) {
            let roleData = null;
            if (account.role === "office") {
              roleData = await Office.findOne({ accountId: account.id }).lean();
            } else if (account.role === "user") {
              roleData = await User.findOne({ accountId: account.id }).lean();
            }
            return {
              id: account.id.toString(),
              username: account.username,
              email: account.email,
              role: account.role,
              roleData,
            };
          } else {
            console.error("Invalid username or password");
            return null;
          }
        } catch (error) {
          console.error("Error authorizing user:", error);
          return null;
        }
      }      
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

            let roleData = null;
            if (user.role === "office") {
              roleData = await Office.findOne({ email: user.email }).lean();
            } else if (user.role === "user") {
              roleData = await User.findOne({ email: user.email }).lean();
            }
            user.roleData = roleData;

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
        token.username = user.username;
        token.email = user.email;
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
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.roleData = token.roleData || null; // Include role-specific data
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
