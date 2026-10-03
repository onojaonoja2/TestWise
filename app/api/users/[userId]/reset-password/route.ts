import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { hash } from "bcryptjs"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { validatePassword } from "@/lib/validators/password"

function canResetPassword(
    actor: { role: string; isSubAdmin?: boolean; organizationId?: string | null },
    target: { organizationId?: string | null },
) {
    if (actor.role === "ADMIN") return true
    if (actor.role === "TEACHER" && actor.isSubAdmin && actor.organizationId && actor.organizationId === target.organizationId) {
        return true
    }
    return false
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ userId: string }> },
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { userId } = await params

    // Admins reset others; users cannot reset their own via this route (use change-password)
    if (userId === session.user.id) {
        return NextResponse.json({ message: "Use Change Password for your own account" }, { status: 400 })
    }

    try {
        const body = await req.json()
        const { newPassword } = body ?? {}
        if (!newPassword) {
            return NextResponse.json({ message: "New password is required" }, { status: 400 })
        }
        const passwordError = validatePassword(newPassword)
        if (passwordError) {
            return NextResponse.json({ message: passwordError }, { status: 400 })
        }

        const target = await prisma.user.findUnique({ where: { id: userId } })
        if (!target) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        if (!canResetPassword(session.user, target)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: await hash(newPassword, 12),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        })

        console.info(`[ADMIN_PASSWORD_RESET] actor=${session.user.id} target=${userId}`)
        return NextResponse.json({ message: `Password reset for ${target.email}` })
    } catch (error) {
        console.error("[ADMIN_PASSWORD_RESET]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
