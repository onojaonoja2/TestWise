import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { compare, hash } from "bcryptjs"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { validatePassword } from "@/lib/validators/password"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { currentPassword, newPassword } = body ?? {}

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Current and new passwords are required" }, { status: 400 })
        }

        if (currentPassword === newPassword) {
            return NextResponse.json({ message: "New password must be different" }, { status: 400 })
        }

        const passwordError = validatePassword(newPassword)
        if (passwordError) {
            return NextResponse.json({ message: passwordError }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!user || !user.password) {
            return NextResponse.json({ message: "Account does not use password login" }, { status: 400 })
        }

        const ok = await compare(currentPassword, user.password)
        if (!ok) {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: await hash(newPassword, 12),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        })

        return NextResponse.json({ message: "Password changed successfully" })
    } catch (error) {
        console.error("[CHANGE_PASSWORD]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
