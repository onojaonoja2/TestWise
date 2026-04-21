import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

const MAXLoginAttempts = 5
const LockoutDurationMinutes = 15

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                    throw new Error("Account temporarily locked due to too many failed login attempts")
                }

                const isValid = await compare(credentials.password, user.password)

                if (isValid) {
                    if (user.failedLoginAttempts > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                failedLoginAttempts: 0,
                                lockedUntil: null
                            }
                        })
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        organizationId: user.organizationId,
                        isSubAdmin: user.isSubAdmin
                    }
                }

                const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
                let lockUntil = null
                
                if (newFailedAttempts >= MAXLoginAttempts) {
                    lockUntil = new Date(Date.now() + LockoutDurationMinutes * 60 * 1000)
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failedLoginAttempts: newFailedAttempts,
                        lockedUntil: lockUntil
                    }
                })

                return null
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.organizationId = user.organizationId
                token.isSubAdmin = user.isSubAdmin
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string
                session.user.id = token.id as string
                session.user.organizationId = token.organizationId
                session.user.isSubAdmin = token.isSubAdmin
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
