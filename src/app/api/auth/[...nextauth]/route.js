import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import Roles from "@/lib/models/roles";
import Admin from "@/lib/models/admin";
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
          
          // Attempt to find the user as an Admin
          let account = await Admin.findOne({ username: credentials.username });
          let userType = "admin";
          
          // If not found as Admin, check User model
          if (!account) {
            account = await User.findOne({ username: credentials.username });
            userType = "user";
          }

          if (account && bcrypt.compareSync(credentials.password, account.password)) {
            return await getUserDetails(account, userType);
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
          let dbAccount = await Admin.findOne({ emailAddress: user.email }) || 
                          await User.findOne({ emailAddress: user.email });
          const userType = dbAccount instanceof Admin ? "admin" : "user";

          if (!dbAccount) {
            console.error("User not found in the database.");
            return false;
          }

          const userDetails = await getUserDetails(dbAccount, userType);
          return userDetails || false;
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.contactNumber = user.contact_number;
        token.email = user.email;
        token.schoolCategory = user.school_category;
        token.userType = user.userType;
        token.office_location = user.office_location;
        token.roleName = user.roleName;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
        session.user.contactNumber = token.contactNumber;
        session.user.email = token.email;
        session.user.schoolCategory = token.schoolCategory;
        session.user.userType = token.userType;
        session.user.office_location = token.office_location;
        session.user.roleName = token.roleName;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
};

// Helper function to get user details based on account data and user type
async function getUserDetails(account, userType) {
  let roleData = null;

  // Admin details
  if (userType === "admin") {
    roleData = await Roles.findOne({ _id: account.role });
  }

  return {
    id: account._id.toString(),
    firstname: account.firstname,
    lastname: account.lastname,
    email: account.emailAddress,
    contact_number: account.contactNumber,
    school_category: account.school_category,
    userType: userType,
    office_location: userType === "admin" ? account.office_location || null : null,
    roleName: roleData ? roleData.name : null,
    permissions: roleData ? roleData.permissions : null,
  };
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
