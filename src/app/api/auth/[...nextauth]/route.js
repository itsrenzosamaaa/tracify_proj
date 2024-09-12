import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getUserbyEmail } from "@/lib/userService";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authenticate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: credentials.username,
                            password: credentials.password,
                        }),
                    });

                    const data = await res.json();

                    if (res.ok && data.id) {
                        return { id: data.id, name: data.name, email: data.email };
                    } else {
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
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        jwt: true,
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign-in
            if (account && user) {
                // Set the email from GoogleProvider or CredentialsProvider
                token.email = user.email;

                // Fetch the user from your database by email
                const dbUser = await getUserbyEmail(token.email);

                if (dbUser) {
                    // Check if the email from the provider matches the one in your database
                    if (dbUser.email === token.email) {
                        // Add role or other properties to the token based on the user
                        token.role = dbUser.role || 'office'; // Assuming 'office' is the default role
                    } else {
                        throw new Error('Email mismatch!'); // Handle the mismatch case if needed
                    }
                } else {
                    throw new Error('User not found!');
                }
            }
            return token;
        },

        async session({ session, token }) {
            // Pass the email and role to the session object
            session.user.email = token.email;
            session.user.role = token.role || 'office'; // Default role

            return session;
        },
    },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };