'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface AuthGuardProps {
    children: ReactNode
    allowedRoles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[]
    redirectTo?: string
}

export function AuthGuard({ 
    children, 
    allowedRoles = [], 
    redirectTo = '/auth/signin' 
}: AuthGuardProps) {
    const { status, data: session } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        router.push(redirectTo)
        return null
    }

    const userRole = session?.user?.role as string | undefined

    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole as 'ADMIN' | 'TEACHER' | 'STUDENT')) {
        router.push('/')
        return null
    }

    return <>{children}</>
}

export function requireAuth(allowedRoles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[]) {
    return function <P extends object>(Component: React.ComponentType<P>) {
        return function ProtectedComponent(props: P) {
            return (
                <AuthGuard allowedRoles={allowedRoles}>
                    <Component {...props} />
                </AuthGuard>
            )
        }
    }
}