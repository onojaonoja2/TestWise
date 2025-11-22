import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name } = body

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        const organization = await prisma.organization.create({
            data: {
                name,
            }
        })

        return NextResponse.json(organization)
    } catch (error) {
        console.error("[ORGANIZATION_CREATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const organizations = await prisma.organization.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        })

        return NextResponse.json(organizations)
    } catch (error) {
        console.error("[ORGANIZATIONS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
