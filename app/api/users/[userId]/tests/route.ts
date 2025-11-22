import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Allow Admin, Sub-Admin (if in same org - simplified to just role check for now), or the user themselves
    const isAuthorized =
        session.user.role === 'ADMIN' ||
        session.user.isSubAdmin ||
        session.user.id === userId

    if (!isAuthorized) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    try {
        console.log(`[USER_TESTS_GET] Fetching tests for userId: ${userId}`)
        const tests = await prisma.test.findMany({
            where: {
                creatorId: userId
            },
            select: {
                id: true,
                title: true,
                published: true,
                archived: true,
                createdAt: true,
                isPublic: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        console.log(`[USER_TESTS_GET] Found ${tests.length} tests`)

        return NextResponse.json(tests)
    } catch (error) {
        console.error("[USER_TESTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
