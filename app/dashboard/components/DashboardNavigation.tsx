'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Building2,
    PlusCircle,
    Archive,
    Menu,
    X,
    LogOut,
    UserCircle,
    Settings,
    Activity
} from 'lucide-react'

type UserSession = {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    isSubAdmin?: boolean
}

export default function DashboardNavigation({ user }: { user: UserSession }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const isTeacherOrAdmin = user.role === 'TEACHER' || user.role === 'ADMIN'

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: pathname === '/dashboard' },
    ]

    if (isTeacherOrAdmin) {
        navigation.push({ name: 'Create Test', href: '/dashboard/create', icon: PlusCircle, current: pathname === '/dashboard/create' })
        navigation.push({ name: 'Manage Groups', href: '/dashboard/groups', icon: Users, current: pathname.startsWith('/dashboard/groups') })
        
        if (user.isSubAdmin) {
            navigation.push({ name: 'Organization', href: '/dashboard/organization', icon: Building2, current: pathname.startsWith('/dashboard/organization') })
        }
        
        navigation.push({ name: 'Archived Tests', href: '/dashboard?view=archived', icon: Archive, current: pathname === '/dashboard?view=archived' })
    }

    if (user.role === 'ADMIN') {
        navigation.push({ name: 'Admin Hub', href: '/dashboard/admin', icon: Activity, current: pathname.startsWith('/dashboard/admin') })
    }

    const classNames = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="relative z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out bg-white shadow-xl">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button type="button" className="-m-2.5 p-2.5 text-white" onClick={() => setSidebarOpen(false)}>
                                    <span className="sr-only">Close sidebar</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                                <div className="flex h-16 shrink-0 items-center">
                                    <span className="text-2xl font-bold text-indigo-600 tracking-tight">TestWise</span>
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={classNames(
                                                                item.current
                                                                    ? 'bg-indigo-50 text-indigo-600'
                                                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200'
                                                            )}
                                                        >
                                                            <item.icon
                                                                className={classNames(
                                                                    item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                                                    'h-6 w-6 shrink-0 transition-colors duration-200'
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 shadow-sm">
                    <div className="flex h-16 shrink-0 items-center mt-2">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                            TestWise
                        </span>
                    </div>
                    <nav className="flex flex-1 flex-col mt-4">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1.5">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={classNames(
                                                    item.current
                                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100'
                                                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                                    'group flex gap-x-3 rounded-md p-2.5 text-sm leading-6 font-semibold transition-all duration-200'
                                                )}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                                        'h-5 w-5 shrink-0 transition-colors duration-200'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <div className="border-t border-gray-200 pt-4 pb-2 mb-2">
                                    <div className="flex items-center gap-x-4 px-2 py-3 rounded-md bg-gray-50 mb-2">
                                        <UserCircle className="h-8 w-8 text-gray-400" />
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900 truncate">
                                                {user.name || user.email}
                                            </p>
                                            <p className="text-xs leading-5 text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/api/auth/signout"
                                        className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                                    >
                                        <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500" aria-hidden="true" />
                                        Sign out
                                    </Link>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                <button type="button" className="-m-2.5 p-2.5 text-gray-700" onClick={() => setSidebarOpen(true)}>
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
                    <span className="text-xl font-bold text-indigo-600">TestWise</span>
                </div>
                <Link href="/api/auth/signout">
                    <span className="sr-only">Sign out</span>
                    <LogOut className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                </Link>
            </div>
        </>
    )
}
