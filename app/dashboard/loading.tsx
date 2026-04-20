import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col h-[70vh] w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg font-medium tracking-tight text-gray-500">Loading your dashboard...</p>
        </div>
    )
}
