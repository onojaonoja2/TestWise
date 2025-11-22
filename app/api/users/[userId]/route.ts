import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { userId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { isSubAdmin, name, email } = body

        // Fetch target user to check their organization
        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!targetUser) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check permissions
        const isGlobalAdmin = session.user.role === 'ADMIN'
        const isSubAdminOfOrg = session.user.role === 'TEACHER' &&
            session.user.isSubAdmin &&
            session.user.organizationId === targetUser.organizationId

        if (!isGlobalAdmin && !isSubAdminOfOrg) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Update user fields
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isSubAdmin: isSubAdmin !== undefined ? isSubAdmin : undefined,
                name: name || undefined,
                email: email || undefined
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("[USER_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { userId } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only Global Admin can delete users
    if (session.user.role !== 'ADMIN') {
        return new NextResponse("Forbidden - Only Admins can delete users", { status: 403 })
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[USER_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
