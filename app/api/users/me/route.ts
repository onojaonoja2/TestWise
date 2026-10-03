import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, role: true, isSubAdmin: true, organizationId: true },
    })
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 })
    return NextResponse.json(user)
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    try {
        const body = await req.json()
        const { name } = body ?? {}
        if (typeof name !== "undefined" && (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100)) {
            return NextResponse.json({ message: "Name must be 1-100 characters" }, { status: 400 })
        }
        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: { name: typeof name === "string" ? name.trim() : undefined },
            select: { id: true, name: true, email: true, image: true, role: true, isSubAdmin: true },
        })
        return NextResponse.json(updated)
    } catch (error) {
        console.error("[ME_PATCH]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
