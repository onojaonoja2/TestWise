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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-2 text-2xl font-bold text-gray-900">Live Exam Monitor</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm text-gray-500">Live Updates</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.length === 0 && !loading && (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            No active students found.
                        </div>
                    )}

                    {students.map((student) => {
                        const online = isOnline(student.lastHeartbeat)
                        return (
                            <div key={student.id} className={`relative rounded-lg border bg-white p-6 shadow-sm ${student.currentWarnings > 0 ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`} title={online ? 'Online' : 'Offline'} />
                                        <h3 className="truncate text-sm font-medium text-gray-900">{student.student.name || student.student.email}</h3>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                        {student.status}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Warnings:</span>
                                        <span className={`font-medium ${student.currentWarnings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {student.currentWarnings}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-gray-500">Last Active:</span>
                                        <span className="text-gray-900">
                                            {new Date(student.lastHeartbeat).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
