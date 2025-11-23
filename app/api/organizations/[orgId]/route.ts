import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { orgId } = await params

    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Verify organization exists
        const org = await prisma.organization.findUnique({
            where: { id: orgId }
        })

        if (!org) {
            return new NextResponse("Organization not found", { status: 404 })
        }

        // Delete organization
        // Due to onDelete: Cascade in schema, this will delete all associated users
        await prisma.organization.delete({
            where: { id: orgId }
        })

        return new NextResponse("Organization deleted", { status: 200 })
    } catch (error) {
        console.error("[ORG_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
