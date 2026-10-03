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
    Settings,
    Activity,
    FileText,
    BrainCircuit
} from 'lucide-react'

type UserSession = {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    isSubAdmin?: boolean
}

function initials(name?: string | null, email?: string | null) {
    const src = (name || email || 'U').trim()
    const parts = src.split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2).toUpperCase()
}

function Avatar({ user, size = 'md' }: { user: UserSession; size?: 'sm' | 'md' | 'lg' }) {
    const dims = size === 'lg' ? 'h-11 w-11 text-sm' : size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs'
    if (user.image) {
        return (
            <img
                src={user.image}
                alt={user.name || user.email || 'Profile'}
                className={`${dims} shrink-0 rounded-full border border-stone-900/10 object-cover bg-white`}
            />
        )
    }
    return (
        <span className={`${dims} flex shrink-0 items-center justify-center rounded-full bg-stone-900 font-bold text-[#FFF7ED]`}>
            {initials(user.name, user.email)}
        </span>
    )
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
        navigation.push({ name: 'Documents', href: '/dashboard/documents', icon: FileText, current: pathname.startsWith('/dashboard/documents') })
        navigation.push({ name: 'Manage Groups', href: '/dashboard/groups', icon: Users, current: pathname.startsWith('/dashboard/groups') })

        if (user.isSubAdmin) {
            navigation.push({ name: 'Organization', href: '/dashboard/organization', icon: Building2, current: pathname.startsWith('/dashboard/organization') })
        }

        navigation.push({ name: 'Archived Tests', href: '/dashboard?view=archived', icon: Archive, current: pathname === '/dashboard?view=archived' })
    }

    if (user.role === 'ADMIN') {
        navigation.push({ name: 'Admin Hub', href: '/dashboard/admin', icon: Activity, current: pathname.startsWith('/dashboard/admin') })
    }

    const secondary = [
        { name: 'Profile & Security', href: '/dashboard/settings', icon: Settings, current: pathname.startsWith('/dashboard/settings') },
    ]

    const classNames = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ')
    }

    const navLinkClass = (current: boolean) =>
        classNames(
            current
                ? 'bg-[#C2410C]/10 text-[#9A3412] shadow-sm ring-1 ring-[#C2410C]/20'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-900/5',
            'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-semibold transition-all duration-200'
        )

    const sidebarContent = (onNavigate?: () => void) => (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-5 pb-4">
            <div className="flex h-16 shrink-0 items-center gap-2.5 mt-2">
                <div className="bg-[#C2410C] p-2 rounded-xl shadow-[0_8px_20px_-8px_rgba(194,65,12,0.6)]">
                    <BrainCircuit className="h-5 w-5 text-[#FFF7ED]" />
                </div>
                <span className="leading-none">
                    <span className="block font-display text-[1.35rem] font-semibold tracking-tight text-stone-900">
                        TestWise
                    </span>
                    <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                        Exam OS
                    </span>
                </span>
            </div>
            <nav className="flex flex-1 flex-col mt-2">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">Workspace</p>
                        <ul role="list" className="-mx-1 space-y-1.5">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={navLinkClass(item.current)}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        <item.icon
                                            className={classNames(
                                                item.current ? 'text-[#C2410C]' : 'text-stone-400 group-hover:text-[#C2410C]',
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
                    <li>
                        <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">Account</p>
                        <ul role="list" className="-mx-1 space-y-1.5">
                            {secondary.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={navLinkClass(item.current)}
                                    >
                                        <item.icon
                                            className={classNames(
                                                item.current ? 'text-[#C2410C]' : 'text-stone-400 group-hover:text-[#C2410C]',
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
                        <div className="border-t border-stone-900/10 pt-4 pb-2 mb-2">
                            <Link href="/dashboard/settings" onClick={onNavigate} className="flex items-center gap-x-3 px-2 py-3 rounded-2xl bg-white border border-stone-900/10 mb-2 hover:border-[#C2410C]/30 transition-colors">
                                <Avatar user={user} />
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-stone-900 truncate">
                                        {user.name || user.email}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-xs leading-5 text-stone-500 capitalize">
                                        {user.role.toLowerCase()}
                                        {user.isSubAdmin ? ' · sub-admin' : ''}
                                    </p>
                                </div>
                                <Settings className="h-4 w-4 shrink-0 text-stone-300" />
                            </Link>
                            <Link
                                href="/api/auth/signout"
                                className="group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-semibold text-stone-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                            >
                                <LogOut className="h-5 w-5 shrink-0 text-stone-400 group-hover:text-red-500" aria-hidden="true" />
                                Sign out
                            </Link>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    )

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="relative z-50 lg:hidden">
                    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-0 flex">
                        <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out bg-[#FFFDF9] border-r border-stone-900/10 shadow-xl">
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                <button type="button" className="-m-2.5 p-2.5 text-white" onClick={() => setSidebarOpen(false)}>
                                    <span className="sr-only">Close sidebar</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            {sidebarContent(() => setSidebarOpen(false))}
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-stone-900/10 bg-[#FFFDF9] shadow-[0_16px_40px_-24px_rgba(28,25,23,0.25)]">
                    {sidebarContent()}
                </div>
            </div>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-[#FAF7F1]/85 backdrop-blur border-b border-stone-900/10 px-4 py-3.5 sm:px-6 lg:hidden">
                <button type="button" className="-m-2.5 p-2.5 text-stone-700 hover:text-stone-900" onClick={() => setSidebarOpen(true)}>
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex flex-1 items-center gap-2">
                    <div className="bg-[#C2410C] p-1.5 rounded-lg">
                        <BrainCircuit className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display text-lg font-semibold tracking-tight text-stone-900">TestWise</span>
                </div>
                <Link href="/dashboard/settings" className="flex items-center" aria-label="Profile settings">
                    <Avatar user={user} size="sm" />
                </Link>
                <Link href="/api/auth/signout" aria-label="Sign out">
                    <span className="sr-only">Sign out</span>
                    <LogOut className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                </Link>
            </div>
        </>
    )
}

export { Avatar }
