import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { validatePassword } from "@/lib/validators/password"

const registerRateLimit = new Map<string, { count: number; resetTime: number }>()
const REGISTER_RATE_LIMIT = 5
const REGISTER_WINDOW_MS = 60 * 60 * 1000

function checkRegisterRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = registerRateLimit.get(ip)

    if (!record || now > record.resetTime) {
        registerRateLimit.set(ip, { count: 1, resetTime: now + REGISTER_WINDOW_MS })
        return true
    }

    if (record.count >= REGISTER_RATE_LIMIT) {
        return false
    }

    record.count++
    return true
}

function getClientIP(request: Request): string {
    const headers = request.headers
    const forwarded = headers.get("x-forwarded-for")
    return forwarded ? forwarded.split(",")[0].trim() : "unknown"
}

export async function POST(req: Request) {
    try {
        const clientIP = getClientIP(req)
        
        if (!checkRegisterRateLimit(clientIP)) {
            return new NextResponse("Too many registration attempts. Please try again later.", { status: 429 })
        }

        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            return new NextResponse(passwordError, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 })
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'STUDENT'
            }
        })

        // Return user without password
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error) {
        console.error("[REGISTER]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
