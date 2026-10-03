import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { verifyPasswordResetToken, consumePasswordResetToken } from "@/lib/password-reset"
import { validatePassword } from "@/lib/validators/password"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, newPassword } = body ?? {}
        if (!token || !newPassword) {
            return NextResponse.json({ message: "Token and new password are required" }, { status: 400 })
        }

        const passwordError = validatePassword(newPassword)
        if (passwordError) {
            return NextResponse.json({ message: passwordError }, { status: 400 })
        }

        const record = await verifyPasswordResetToken(String(token))
        if (!record) {
            return NextResponse.json({ message: "Reset link is invalid or expired" }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: record.userId },
            data: {
                password: await hash(String(newPassword), 12),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        })
        await consumePasswordResetToken(record.id)

        return NextResponse.json({ message: "Password reset successfully. You can now sign in." })
    } catch (error) {
        console.error("[RESET_PASSWORD]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
