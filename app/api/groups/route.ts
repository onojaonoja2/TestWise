import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const groups = await prisma.studentGroup.findMany({
            where: {
                creatorId: session.user.id
            },
            include: {
                _count: {
                    select: { members: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(groups)
    } catch (error) {
        console.error("[GROUPS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name } = body

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        const group = await prisma.studentGroup.create({
            data: {
                name,
                creatorId: session.user.id
            }
        })

        return NextResponse.json(group)
    } catch (error) {
        console.error("[GROUPS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
