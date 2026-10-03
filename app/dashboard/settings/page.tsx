'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Eye, EyeOff, Loader2, ShieldCheck, Trash2, User as UserIcon } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import { passwordStrength } from '@/lib/validators/password'

type Me = {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    isSubAdmin: boolean
}

function initials(name?: string | null, email?: string) {
    const src = (name || email || 'U').trim()
    const parts = src.split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2).toUpperCase()
}

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const { showToast } = useToast()
    const [me, setMe] = useState<Me | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'profile' | 'security'>('profile')

    const [name, setName] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [changing, setChanging] = useState(false)

    useEffect(() => {
        fetchMe()
    }, [])

    const fetchMe = async () => {
        try {
            const res = await fetch('/api/users/me')
            if (res.ok) {
                const data = await res.json()
                setMe(data)
                setName(data.name ?? '')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleFile = async (file: File | undefined) => {
        if (!file) return
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast('Only JPG, PNG or WebP images are allowed', 'error')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be under 2MB', 'error')
            return
        }
        setPreview(URL.createObjectURL(file))
        setUploading(true)
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await fetch('/api/users/me/avatar', { method: 'POST', body: form })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Upload failed')
            setMe((prev) => (prev ? { ...prev, image: data.image } : prev))
            setPreview(null)
            await update?.({ user: { image: data.image, name: me?.name } })
            showToast('Profile picture updated', 'success')
        } catch (e) {
            setPreview(null)
            showToast(e instanceof Error ? e.message : 'Upload failed', 'error')
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    const handleRemoveAvatar = async () => {
        setUploading(true)
        try {
            const res = await fetch('/api/users/me/avatar', { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to remove')
            setMe((prev) => (prev ? { ...prev, image: null } : prev))
            await update?.({ user: { image: null } })
            showToast('Profile picture removed', 'success')
        } catch {
            showToast('Failed to remove picture', 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setSavingName(true)
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save')
            setMe((prev) => (prev ? { ...prev, name: data.name } : prev))
            await update?.({ user: { name: data.name } })
            showToast('Profile updated', 'success')
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Failed to save', 'error')
        } finally {
            setSavingName(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error')
            return
        }
        setChanging(true)
        try {
            const res = await fetch('/api/account/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to change password')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            showToast('Password changed successfully', 'success')
        } catch (e) {
            showToast(e instanceof Error ? e.message : 'Failed to change password', 'error')
        } finally {
            setChanging(false)
        }
    }

    if (loading) {
        return <div className="paper-card rounded-[1.5rem] p-8 text-center text-sm text-stone-500">Loading profile...</div>
    }

    const avatarSrc = preview || me?.image
    const strength = passwordStrength(newPassword)

    return (
        <div className="space-y-6">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C2410C]">Account</p>
                <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-stone-900">Profile & Security</h1>
                <p className="mt-1 text-sm text-stone-500">Manage your picture, name, and password. Signed in as {session?.user?.email}.</p>
            </div>

            <div className="inline-flex rounded-full border border-stone-900/10 bg-white p-1">
                {(['profile', 'security'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === t ? 'bg-stone-900 text-[#FFF7ED]' : 'text-stone-500 hover:text-stone-900'}`}
                    >
                        {t === 'profile' ? 'Profile' : 'Security'}
                    </button>
                ))}
            </div>

            {tab === 'profile' && (
                <div className="paper-card rounded-[1.75rem] p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Profile" className="h-24 w-24 rounded-full border border-stone-900/10 object-cover bg-white" />
                                ) : (
                                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-900 font-display text-2xl font-semibold text-[#FFF7ED]">
                                        {initials(me?.name, me?.email)}
                                    </span>
                                )}
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#C2410C] text-white shadow-lg hover:bg-[#9A3412] disabled:opacity-50 transition-colors"
                                    aria-label="Upload profile picture"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                </button>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] disabled:opacity-50">
                                    {uploading ? 'Uploading...' : 'Change photo'}
                                </button>
                                {me?.image && (
                                    <button onClick={handleRemoveAvatar} disabled={uploading} className="inline-flex items-center gap-1 text-sm font-medium text-stone-400 hover:text-red-600">
                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-stone-400">JPG, PNG or WebP · max 2MB</p>
                        </div>

                        <form onSubmit={handleSaveName} className="flex-1 w-full space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-stone-800">Full name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="mt-2 block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-800">Email</label>
                                <input value={me?.email ?? ''} disabled className="mt-2 block w-full rounded-xl border border-stone-900/10 bg-stone-900/[0.03] py-2.5 px-3.5 text-stone-500 sm:text-sm" />
                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500">
                                    <UserIcon className="h-3.5 w-3.5" /> Role: <span className="font-semibold capitalize text-stone-700">{me?.role.toLowerCase()}</span>
                                    {me?.isSubAdmin ? ' · Sub-admin' : ''}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={savingName || !name.trim() || name.trim() === (me?.name ?? '')}
                                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-[#FFF7ED] hover:bg-[#C2410C] disabled:opacity-50 transition-colors"
                            >
                                {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {tab === 'security' && (
                <div className="grid gap-5 lg:grid-cols-2">
                    <form onSubmit={handleChangePassword} className="paper-card rounded-[1.75rem] p-6 sm:p-8 space-y-4">
                        <h2 className="font-display text-xl font-semibold text-stone-900">Change password</h2>
                        <p className="text-sm text-stone-500">You&apos;ll stay signed in on this device.</p>
                        {[
                            { label: 'Current password', value: currentPassword, set: setCurrentPassword, auto: 'current-password' },
                            { label: 'New password', value: newPassword, set: setNewPassword, auto: 'new-password' },
                            { label: 'Confirm new password', value: confirmPassword, set: setConfirmPassword, auto: 'new-password' },
                        ].map((f) => (
                            <div key={f.label}>
                                <label className="block text-sm font-semibold text-stone-800">{f.label}</label>
                                <div className="relative mt-2">
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={f.value}
                                        onChange={(e) => f.set(e.target.value)}
                                        autoComplete={f.auto}
                                        required
                                        className="block w-full rounded-xl border border-stone-900/10 bg-white py-2.5 px-3.5 pr-11 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 sm:text-sm transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700" aria-label="Toggle password visibility">
                                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {newPassword && (
                            <div>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? 'bg-[#C2410C]' : 'bg-stone-900/10'}`} />
                                    ))}
                                </div>
                                <p className="mt-1.5 text-xs text-stone-500">Strength: <span className="font-semibold text-stone-700">{strength.label}</span> · min 8 chars, upper, lower, number & symbol</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={changing || !currentPassword || !newPassword || newPassword !== confirmPassword}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#9A3412] disabled:opacity-50 transition-colors"
                        >
                            {changing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Update password
                        </button>
                    </form>

                    <div className="paper-card rounded-[1.75rem] p-6 sm:p-8">
                        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-stone-900">
                            <ShieldCheck className="h-5 w-5 text-[#C2410C]" /> Good to know
                        </h2>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
                            <li>· Use a unique password you don&apos;t reuse elsewhere.</li>
                            <li>· After 5 wrong sign-in attempts your account locks for 15 minutes.</li>
                            <li>· Forgot your password? Use the reset link on the sign-in page — it expires in 1 hour.</li>
                            <li>· Admins can reset passwords for people in their organization, but never see your current password.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
