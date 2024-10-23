import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import Roles from "@/lib/models/roles";
import Account from "@/lib/models/account";
import Admin from "@/lib/models/admin";
import Student from "@/lib/models/student";
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
          const account = await Account.findOne({
            username: credentials.username,
          });

          if (
            account &&
            bcrypt.compareSync(credentials.password, account.password)
          ) {
            return await getUserDetails(account);
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
          prompt: "select_account",
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
    async signIn({ user, account, profile }) {
      try {
        // If Google sign-in, find user by email
        if (account.provider === "google" && user.email) {
          await dbConnect();
          const dbAccount = await Account.findOne({ emailAddress: user.email });
          if (!dbAccount) {
            console.error("User not found in the database.");
            return false;
          }
          const userDetails = await getUserDetails(dbAccount);

          if (!userDetails) {
            return false;
          }

          // Return the user details so they are passed to jwt callback
          return userDetails;
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // When user is available (for initial sign-in), store details in token
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.contactNumber = user.contact_number;
        token.email = user.email;
        token.schoolCategory = user.school_category;
        token.userType = user.userType;
        token.office_name = user.office_name;
        token.office_location = user.office_location;
        token.roleName = user.roleName;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach token data to session
      if (token) {
        session.user.id = token.id;
        session.user.firstname = token.firstname;
        session.user.lastname = token.lastname;
        session.user.contactNumber = token.contactNumber;
        session.user.email = token.email;
        session.user.schoolCategory = token.schoolCategory;
        session.user.userType = token.userType;
        session.user.office_name = token.office_name;
        session.user.office_location = token.office_location;
        session.user.roleName = token.roleName;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
};

// Helper function to get user details based on account data
async function getUserDetails(account) {
  let details = null;
  let userType = "";
  let roleData = null;

  if (account.type === "admin") {
    details = await Admin.findOne({ account: account._id });
    if (!details) {
      console.error("Admin details not found.");
      return null;
    }
    roleData = await Roles.findOne({ _id: details.role });
    userType = "admin";
  } else {
    details = await Student.findOne({ account: account._id });
    if (!details) {
      console.error("Student details not found.");
      return null;
    }
    userType = "student";
  }

  return {
    id: details._id.toString(),
    firstname: details.firstname,
    lastname: details.lastname,
    email: account.emailAddress,
    contact_number: details.contactNumber,
    school_category: details.school_category,
    userType: userType,
    office_name: details.office_name || null,
    office_location: details.office_location || null,
    roleName: roleData ? roleData.name : null,
    permissions: roleData ? roleData.permissions : null,
  };
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
