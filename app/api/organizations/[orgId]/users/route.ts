import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { orgId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check permissions: Global Admin or Sub-Admin of this Org
    const isGlobalAdmin = session.user.role === 'ADMIN'
    const isSubAdmin = session.user.role === 'TEACHER' &&
        session.user.isSubAdmin &&
        session.user.organizationId === orgId

    if (!isGlobalAdmin && !isSubAdmin) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        const body = await req.json()
        const { name, email, password, isSubAdmin: makeSubAdmin } = body

        if (!email || !password || !name) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 })
        }

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'TEACHER',
                organizationId: orgId,
                isSubAdmin: makeSubAdmin || false
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[ORG_USER_CREATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { orgId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check permissions: Global Admin or any Teacher in this Org
    const isGlobalAdmin = session.user.role === 'ADMIN'
    const isOrgMember = session.user.organizationId === orgId

    if (!isGlobalAdmin && !isOrgMember) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                organizationId: orgId,
                role: 'TEACHER' // Only list teachers for now
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("[ORG_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
