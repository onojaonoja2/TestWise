import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/admin/') || pathname === '/admin') {
        return NextResponse.next()
    }

    if (pathname.startsWith('/teacher/') || pathname === '/teacher') {
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/teacher/:path*',
    ],
}