import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";
import role from "@/lib/models/role";
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
          const account = await User.findOne({
            username: credentials.username,
          }).populate("role");

          if (
            account &&
            bcrypt.compareSync(credentials.password, account.password)
          ) {
            return {
              id: account._id.toString(),
              firstname: account.firstname,
              lastname: account.lastname,
              profile_picture: account.profile_picture || "",
              email: account.emailAddress || "",
              contact_number: account.contactNumber || "",
              roleName: account.role?.name || "Guest", // ✅ Default to "Guest" if no role
              permissions: account.role?.permissions || [], // ✅ Default to empty array if no permissions
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
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  pages: { signIn: "/" }, // Custom sign-in page
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === "google" && user.email) {
          await dbConnect();

          // Fetch user details from database
          const dbAccount = await User.findOne({ emailAddress: user.email }).populate("role");

          if (!dbAccount) {
            console.error("User not found in the database.");
            return false; // Reject sign-in if user doesn't exist in the database
          }

          user.id = dbAccount._id.toString();
          user.firstname = dbAccount.firstname;
          user.lastname = dbAccount.lastname;
          user.profile_picture = dbAccount.profile_picture;
          user.contact_number = dbAccount.contactNumber;
          user.roleName = dbAccount.role?.name || "Guest";
          user.permissions = dbAccount.role?.permissions || [];
        }
        return true; // For credentials sign-in
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        if (session?.user?.permissions && session?.user?.roleName) {
          token.roleName = session.user.roleName;
          token.permissions = session.user.permissions;
        } else if (session?.user?.profile_picture) {
          token.profile_picture = session.user.profile_picture;
        }
      }
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.profile_picture = user.profile_picture;
        token.contactNumber = user.contact_number;
        token.email = user.email;
        token.roleName = user.roleName || "Guest";
        token.permissions = user.permissions || [];
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
        session.user.profile_picture = token.profile_picture;
        session.user.contactNumber = token.contactNumber;
        session.user.email = token.email;
        session.user.roleName = token.roleName || "Guest";
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
