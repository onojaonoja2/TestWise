import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // Custom logic if needed, e.g. role-based access control
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Protect admin routes
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // Protect teacher routes
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
        "/test/:path*",
        "/admin/:path*",
        "/teacher/:path*"
    ]
}
