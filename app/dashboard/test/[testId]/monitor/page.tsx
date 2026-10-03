'use client'

import { useState, useEffect, use } from 'react'
import BackButton from '@/app/components/BackButton'

interface ActiveStudent {
    id: string
    student: {
        name: string | null
        email: string
    }
    status: 'STARTED' | 'COMPLETED'
    currentWarnings: number
    lastHeartbeat: string
}

export default function MonitorPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params)
    const [students, setStudents] = useState<ActiveStudent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActiveStudents = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}/monitor`)
                if (res.ok) {
                    const data = await res.json()
                    setStudents(data)
                }
            } catch (error) {
                console.error("Failed to fetch monitor data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchActiveStudents()
        const interval = setInterval(fetchActiveStudents, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [testId])

    const isOnline = (lastHeartbeat: string) => {
        const diff = new Date().getTime() - new Date(lastHeartbeat).getTime()
        return diff < 15000 // Considered online if heartbeat within last 15 seconds
    }

    return (
        <div className="space-y-8">
            <div>
                <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display mt-2 text-2xl font-semibold text-stone-900">Live Exam Monitor</h1>
                        <p className="mt-1 text-sm text-stone-500">Presence, warnings, and progress refresh every few seconds.</p>
                    </div>
                    <div className="flex items-center space-x-2 rounded-full border border-stone-900/10 bg-white px-4 py-2 shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                        <span className="text-sm font-medium text-stone-600">Live Updates</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {students.length === 0 && !loading && (
                    <div className="paper-card rounded-[1.5rem] col-span-full text-center text-stone-500 py-12">
                        No active students found.
                    </div>
                )}

                {students.map((student) => {
                    const online = isOnline(student.lastHeartbeat)
                    return (
                        <div key={student.id} className={`paper-card relative rounded-[1.5rem] p-6 ${student.currentWarnings > 0 ? 'border-red-300 ring-1 ring-red-200' : ''}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${online ? 'bg-emerald-500' : 'bg-stone-300'}`} title={online ? 'Online' : 'Offline'} />
                                    <h3 className="truncate text-sm font-semibold text-stone-900">{student.student.name || student.student.email}</h3>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#FAF7F1] border border-stone-900/10 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                                    {student.status}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Warnings:</span>
                                    <span className={`font-semibold ${student.currentWarnings > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {student.currentWarnings}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-stone-500">Last Active:</span>
                                    <span className="text-stone-900 font-medium">
                                        {new Date(student.lastHeartbeat).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
