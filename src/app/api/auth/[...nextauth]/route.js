import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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
        jwt: false,
    },
    callbacks: {
        async session({ session, token }) {
            // Include the email and other token properties in the session
            session.user.email = token.email;
            session.user.role = token.role; // You can add other properties like 'role' if needed
            return session;
        },
        async jwt({ token, user, account }) {
            // Initial sign-in
            if (account && user) {
                token.email = user.email; // Add email to token
                token.role = 'office'; // Optionally, assign a role
            }
            return token;
        },
    },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };