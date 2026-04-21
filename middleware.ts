import { withAuth } from "next-auth/middleware"
import { NextResponse, NextRequest } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RateLimitWindowMs = 15 * 60 * 1000
const MaxRequestsPerWindow = 10

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RateLimitWindowMs })
        return true
    }

    if (record.count >= MaxRequestsPerWindow) {
        return false
    }

    record.count++
    return true
}

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for")
    return forwarded ? forwarded.split(",")[0].trim() : req.ip ?? "unknown"
}

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        if (path.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/teacher/:path*"
    ]
}
