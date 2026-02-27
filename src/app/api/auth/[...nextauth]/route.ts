import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import PostgresAdapter from "@auth/pg-adapter"
import postgres from "postgres"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export const authOptions = {
    adapter: PostgresAdapter(pool),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const [user] = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            }
        })
        // You can add more providers here (Email, GitHub, etc.)
    ],
    callbacks: {
        async session({ session, user }: any) {
            if (session.user) {
                session.user.id = user.id;
                // Optionally fetch extra profile data from the DB
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
