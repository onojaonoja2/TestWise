import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { groupId } = await params

    if (!session || session.user.role !== 'TEACHER') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { students } = body // Array of { name, email, password }

        if (!students || !Array.isArray(students) || students.length === 0) {
            return new NextResponse("Students array is required", { status: 400 })
        }

        // Verify group ownership
        const group = await prisma.studentGroup.findUnique({
            where: { id: groupId }
        })

        if (!group) {
            return new NextResponse("Group not found", { status: 404 })
        }

        if (group.creatorId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const results = []

        // Process each student
        // We do this in a transaction to ensure atomicity per student or overall? 
        // Let's do it overall for now, or maybe just loop. 
        // Ideally we want to provide feedback on who was added and who failed.
        // But for simplicity, let's try to process all.

        for (const student of students) {
            const { name, email, password } = student

            if (!email || !password) continue

            // Check if user exists
            let user = await prisma.user.findUnique({
                where: { email }
            })

            if (!user) {
                // Create new user
                const hashedPassword = await hash(password, 10)
                user = await prisma.user.create({
                    data: {
                        name: name || email.split('@')[0],
                        email,
                        password: hashedPassword,
                        role: 'STUDENT',
                        // Optionally link to teacher's org if needed, but for now independent or same org?
                        // If teacher has org, maybe student belongs to it?
                        organizationId: session.user.organizationId
                    }
                })
            }

            // Add to group (ignore if already member)
            try {
                await prisma.studentGroupMember.create({
                    data: {
                        groupId,
                        studentId: user.id
                    }
                })
                results.push({ email, status: 'added' })
            } catch (e) {
                // Likely unique constraint violation if already member
                results.push({ email, status: 'already_member' })
            }
        }

        return NextResponse.json({ message: "Processed students", results })
    } catch (error) {
        console.error("[GROUP_ADD_STUDENTS]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const session = await getServerSession(authOptions)
    const { groupId } = await params

    if (!session || session.user.role !== 'TEACHER') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const group = await prisma.studentGroup.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        student: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!group) {
            return new NextResponse("Group not found", { status: 404 })
        }

        if (group.creatorId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Transform to simple list of students
        const students = group.members.map(m => ({
            email: m.student.email,
            name: m.student.name
        }))

        return NextResponse.json(students)
    } catch (error) {
        console.error("[GROUP_GET_STUDENTS]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
