import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            organizationId?: string | null
            isSubAdmin?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        organizationId?: string | null
        isSubAdmin?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        id: string
        organizationId?: string | null
        isSubAdmin?: boolean
    }
}
