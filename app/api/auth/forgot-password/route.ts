import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetToken } from "@/lib/password-reset"
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email"

const attempts = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000

function throttled(key: string): boolean {
    const now = Date.now()
    const rec = attempts.get(key)
    if (!rec || now > rec.resetAt) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
        return false
    }
    if (rec.count >= LIMIT) return true
    rec.count++
    return false
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

        // Always return generic success to avoid account enumeration
        const generic = () => NextResponse.json({ message: "If an account exists, a reset link has been sent." })

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return generic()
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        if (throttled(`${ip}:${email}`)) {
            return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) {
            return generic()
        }

        if (!isEmailConfigured()) {
            console.warn("[FORGOT_PASSWORD] Email not configured; skipping send")
            return generic()
        }

        const token = await createPasswordResetToken(user.id)
        try {
            await sendPasswordResetEmail(user.email, token, user.name)
        } catch (e) {
            console.error("[FORGOT_PASSWORD_SEND]", e)
            // Still return generic to avoid leaking config state
        }
        return generic()
    } catch (error) {
        console.error("[FORGOT_PASSWORD]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
